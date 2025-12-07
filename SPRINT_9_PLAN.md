# Sprint 9: Integrations & Automation

**Sprint Duration:** Week 15-16 (estimated 2-3 weeks)  
**Status:** 📋 Planned  
**Priority:** High 🟠  
**Main Goals:**

1. Webhook system for third-party integrations
2. Calendar sync (Google/Outlook)
3. Email template customization
4. API documentation

---

## 📋 Executive Summary

Sprint 9 enables ScaleFlow to integrate with external systems and automate workflows. This sprint builds the integration layer that connects ScaleFlow with the broader business ecosystem.

**Expected Impact:**

- Connect with 10+ external services
- Automate 50%+ of repetitive tasks
- Enable enterprise integration scenarios
- Support custom workflows

---

## 🎯 Sprint Objectives

### Primary Goals

1. **Webhooks** (P1 - Critical)
   - Outgoing webhooks for events
   - Webhook management UI
   - Retry logic and logging
   - HMAC signature verification

2. **Calendar Sync** (P2 - High)
   - Google Calendar integration
   - Outlook Calendar integration
   - iCal feed generation
   - Two-way sync (optional)

3. **Email Templates** (P3 - Medium)
   - Customizable email templates
   - Template editor with preview
   - Company branding

---

## 📦 Task Breakdown

### Task 1: Webhook Database Schema (3 hours)

**Database Design:**

```sql
CREATE TABLE webhooks (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  company_id UUID REFERENCES companies(id) NOT NULL,
  name TEXT NOT NULL,
  url TEXT NOT NULL,
  events TEXT[] NOT NULL,  -- e.g., ['shift.created', 'shift.updated']
  secret TEXT NOT NULL,  -- For HMAC signature
  active BOOLEAN DEFAULT true,
  retry_count INT DEFAULT 3,
  timeout_seconds INT DEFAULT 30,
  headers JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE webhook_deliveries (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  webhook_id UUID REFERENCES webhooks(id) ON DELETE CASCADE,
  event_type TEXT NOT NULL,
  payload JSONB NOT NULL,
  request_headers JSONB,
  response_code INT,
  response_body TEXT,
  response_time_ms INT,
  success BOOLEAN,
  attempt INT DEFAULT 1,
  delivered_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_webhooks_company ON webhooks(company_id);
CREATE INDEX idx_webhook_deliveries_webhook ON webhook_deliveries(webhook_id, created_at DESC);
CREATE INDEX idx_webhook_deliveries_pending ON webhook_deliveries(webhook_id) WHERE success = false AND attempt < 3;

-- RLS Policies
ALTER TABLE webhooks ENABLE ROW LEVEL SECURITY;
ALTER TABLE webhook_deliveries ENABLE ROW LEVEL SECURITY;

CREATE POLICY webhooks_company_access 
  ON webhooks 
  USING (
    company_id IN (
      SELECT company_id FROM profiles 
      WHERE id = auth.uid() AND role_id = (SELECT id FROM roles WHERE name = 'manager')
    )
  );
```

**Webhook Events:**
- `shift.created`
- `shift.updated`
- `shift.deleted`
- `shift.assigned`
- `employee.invited`
- `swap_request.created`
- `swap_request.approved`
- `schedule.published`
- `notification.sent`

**Files to Create:**
- `supabase/migrations/[timestamp]_create_webhooks.sql`
- `src/types/webhooks.ts`

---

### Task 2: Webhook Service (6 hours)

**Service Implementation:**

```typescript
// src/services/webhook.service.ts

import crypto from 'crypto';

export class WebhookService {
  /**
   * Register a webhook
   */
  static async registerWebhook(params: {
    companyId: string;
    name: string;
    url: string;
    events: string[];
    secret?: string;
  }): Promise<Webhook> {
    const secret = params.secret || generateSecret();
    
    // Validate URL
    if (!isValidUrl(params.url)) {
      throw new Error('Invalid webhook URL');
    }

    // Create webhook
    const webhook = await supabase
      .from('webhooks')
      .insert({
        company_id: params.companyId,
        name: params.name,
        url: params.url,
        events: params.events,
        secret,
      })
      .single();

    return webhook;
  }

  /**
   * Trigger webhook for event
   */
  static async triggerWebhook(
    event: string,
    payload: any,
    companyId: string
  ): Promise<void> {
    // Find webhooks subscribed to this event
    const webhooks = await supabase
      .from('webhooks')
      .select('*')
      .eq('company_id', companyId)
      .eq('active', true)
      .contains('events', [event]);

    // Queue delivery for each webhook
    for (const webhook of webhooks) {
      await this.queueDelivery(webhook, event, payload);
    }
  }

  /**
   * Queue webhook delivery
   */
  private static async queueDelivery(
    webhook: Webhook,
    event: string,
    payload: any
  ): Promise<void> {
    await supabase.from('webhook_deliveries').insert({
      webhook_id: webhook.id,
      event_type: event,
      payload,
      success: false,
      attempt: 0,
    });

    // Trigger edge function to process delivery
    await supabase.functions.invoke('process-webhooks');
  }

  /**
   * Sign payload with HMAC
   */
  static signPayload(payload: string, secret: string): string {
    return crypto
      .createHmac('sha256', secret)
      .update(payload)
      .digest('hex');
  }

  /**
   * Verify webhook signature
   */
  static verifySignature(payload: string, signature: string, secret: string): boolean {
    const expectedSignature = this.signPayload(payload, secret);
    return crypto.timingSafeEqual(
      Buffer.from(signature),
      Buffer.from(expectedSignature)
    );
  }
}
```

**Edge Function:**

```typescript
// supabase/functions/process-webhooks/index.ts

serve(async (req) => {
  // Get pending deliveries
  const { data: deliveries } = await supabase
    .from('webhook_deliveries')
    .select('*, webhook:webhooks(*)')
    .eq('success', false)
    .lt('attempt', 3)
    .limit(10);

  for (const delivery of deliveries) {
    try {
      // Sign payload
      const payloadStr = JSON.stringify(delivery.payload);
      const signature = WebhookService.signPayload(payloadStr, delivery.webhook.secret);

      // Send webhook
      const startTime = Date.now();
      const response = await fetch(delivery.webhook.url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-ScaleFlow-Signature': signature,
          'X-ScaleFlow-Event': delivery.event_type,
          ...delivery.webhook.headers,
        },
        body: payloadStr,
        signal: AbortSignal.timeout(delivery.webhook.timeout_seconds * 1000),
      });

      const responseTime = Date.now() - startTime;

      // Update delivery
      await supabase
        .from('webhook_deliveries')
        .update({
          response_code: response.status,
          response_body: await response.text(),
          response_time_ms: responseTime,
          success: response.ok,
          attempt: delivery.attempt + 1,
          delivered_at: new Date().toISOString(),
        })
        .eq('id', delivery.id);

    } catch (error) {
      // Log error and update attempt count
      await supabase
        .from('webhook_deliveries')
        .update({
          response_body: error.message,
          success: false,
          attempt: delivery.attempt + 1,
        })
        .eq('id', delivery.id);
    }
  }

  return new Response(JSON.stringify({ processed: deliveries.length }));
});
```

**Files to Create:**
- `src/services/webhook.service.ts`
- `supabase/functions/process-webhooks/index.ts`

---

### Task 3: Webhook Management UI (5 hours)

**UI Components:**

```typescript
// src/pages/Integrations.tsx
export const IntegrationsPage = () => {
  const [webhooks, setWebhooks] = useState<Webhook[]>([]);

  return (
    <Layout>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h1>Integrations</h1>
          <Button onClick={() => setShowCreateModal(true)}>
            Add Webhook
          </Button>
        </div>

        <WebhookList 
          webhooks={webhooks}
          onEdit={handleEdit}
          onDelete={handleDelete}
          onTest={handleTest}
        />

        <WebhookDeliveryLog webhookId={selectedWebhook} />
      </div>
    </Layout>
  );
};

// src/components/Integrations/CreateWebhookModal.tsx
export const CreateWebhookModal = ({ onClose, onSave }) => {
  const [formData, setFormData] = useState({
    name: '',
    url: '',
    events: [],
  });

  return (
    <Dialog open onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Create Webhook</DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit}>
          <Input
            label="Name"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
          />
          
          <Input
            label="Endpoint URL"
            type="url"
            value={formData.url}
            onChange={(e) => setFormData({ ...formData, url: e.target.value })}
          />

          <EventSelector
            selected={formData.events}
            onChange={(events) => setFormData({ ...formData, events })}
          />

          <Button type="submit">Create Webhook</Button>
        </form>
      </DialogContent>
    </Dialog>
  );
};
```

**Features:**
- Create/edit/delete webhooks
- Test webhook functionality
- View delivery logs
- Retry failed deliveries
- View webhook secret
- Enable/disable webhooks

**Files to Create:**
- `src/pages/Integrations.tsx`
- `src/components/Integrations/WebhookList.tsx`
- `src/components/Integrations/CreateWebhookModal.tsx`
- `src/components/Integrations/WebhookDeliveryLog.tsx`

---

### Task 4: Calendar Integration - Google (5 hours)

**OAuth Setup:**

```typescript
// src/services/google-calendar.service.ts

export class GoogleCalendarService {
  private static CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID;
  private static REDIRECT_URI = `${window.location.origin}/auth/google/callback`;

  /**
   * Initiate OAuth flow
   */
  static async authorize(): Promise<void> {
    const authUrl = `https://accounts.google.com/o/oauth2/v2/auth?${new URLSearchParams({
      client_id: this.CLIENT_ID,
      redirect_uri: this.REDIRECT_URI,
      response_type: 'code',
      scope: 'https://www.googleapis.com/auth/calendar',
      access_type: 'offline',
      prompt: 'consent',
    })}`;

    window.location.href = authUrl;
  }

  /**
   * Exchange code for tokens
   */
  static async handleCallback(code: string): Promise<void> {
    const { data: tokens } = await supabase.functions.invoke('google-oauth', {
      body: { code },
    });

    // Save tokens to user profile
    await supabase
      .from('calendar_integrations')
      .upsert({
        user_id: session.user.id,
        provider: 'google',
        access_token: tokens.access_token,
        refresh_token: tokens.refresh_token,
        expires_at: new Date(Date.now() + tokens.expires_in * 1000).toISOString(),
      });
  }

  /**
   * Sync shift to Google Calendar
   */
  static async syncShift(shift: Shift): Promise<void> {
    const tokens = await this.getTokens();
    
    const event = {
      summary: `Shift - ${shift.employee_name}`,
      start: { dateTime: shift.start_time },
      end: { dateTime: shift.end_time },
      description: shift.notes,
    };

    await fetch('https://www.googleapis.com/calendar/v3/calendars/primary/events', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${tokens.access_token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(event),
    });
  }
}
```

**Files to Create:**
- `src/services/google-calendar.service.ts`
- `src/pages/auth/GoogleCallback.tsx`
- `supabase/functions/google-oauth/index.ts`

---

### Task 5: Calendar Integration - Outlook (4 hours)

Similar to Google Calendar but using Microsoft Graph API.

**Files to Create:**
- `src/services/outlook-calendar.service.ts`
- `src/pages/auth/OutlookCallback.tsx`
- `supabase/functions/outlook-oauth/index.ts`

---

### Task 6: iCal Feed Generation (3 hours)

**iCal Service:**

```typescript
// src/services/ical.service.ts

import ical from 'ical-generator';

export class ICalService {
  /**
   * Generate iCal feed for user's shifts
   */
  static async generateFeed(userId: string): Promise<string> {
    const shifts = await getShiftsForUser(userId);
    
    const calendar = ical({ name: 'ScaleFlow Schedule' });

    for (const shift of shifts) {
      calendar.createEvent({
        start: new Date(shift.start_time),
        end: new Date(shift.end_time),
        summary: `Shift - ${shift.location || 'Work'}`,
        description: shift.notes,
        location: shift.location,
      });
    }

    return calendar.toString();
  }

  /**
   * Generate public iCal URL with token
   */
  static async createPublicFeed(userId: string): Promise<string> {
    const token = generateSecureToken();
    
    await supabase.from('ical_feeds').insert({
      user_id: userId,
      token,
      active: true,
    });

    return `${API_URL}/ical/${token}`;
  }
}
```

**API Endpoint:**

```typescript
// supabase/functions/ical-feed/index.ts

serve(async (req) => {
  const token = req.url.split('/').pop();
  
  // Verify token
  const { data: feed } = await supabase
    .from('ical_feeds')
    .select('*, user:profiles(*)')
    .eq('token', token)
    .eq('active', true)
    .single();

  if (!feed) {
    return new Response('Not Found', { status: 404 });
  }

  // Generate iCal
  const icalData = await ICalService.generateFeed(feed.user_id);

  return new Response(icalData, {
    headers: {
      'Content-Type': 'text/calendar',
      'Content-Disposition': 'attachment; filename="schedule.ics"',
    },
  });
});
```

**Files to Create:**
- `src/services/ical.service.ts`
- `supabase/functions/ical-feed/index.ts`

---

### Task 7: Email Template Customization (4 hours)

**Template Editor:**

```typescript
// src/components/Settings/EmailTemplateEditor.tsx
export const EmailTemplateEditor = () => {
  const [templates, setTemplates] = useState<EmailTemplate[]>([]);
  const [selectedTemplate, setSelectedTemplate] = useState<EmailTemplate | null>(null);

  return (
    <div className="grid grid-cols-3 gap-6">
      <div className="col-span-1">
        <TemplateList
          templates={templates}
          selected={selectedTemplate}
          onSelect={setSelectedTemplate}
        />
      </div>

      <div className="col-span-2 space-y-4">
        <Input
          label="Subject"
          value={selectedTemplate?.subject}
          onChange={handleSubjectChange}
        />

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label>HTML Template</label>
            <textarea
              className="font-mono"
              value={selectedTemplate?.html}
              onChange={handleHTMLChange}
            />
          </div>

          <div>
            <label>Preview</label>
            <div
              className="border rounded p-4"
              dangerouslySetInnerHTML={{ __html: compiledHTML }}
            />
          </div>
        </div>

        <div>
          <label>Available Variables</label>
          <code className="block bg-gray-100 p-2 rounded">
            {'{{userName}}, {{shiftDate}}, {{startTime}}, {{endTime}}'}
          </code>
        </div>

        <Button onClick={handleSave}>Save Template</Button>
        <Button onClick={handleTest} variant="outline">Send Test Email</Button>
      </div>
    </div>
  );
};
```

**Files to Create:**
- `src/components/Settings/EmailTemplateEditor.tsx`
- `src/services/email-template.service.ts`

---

### Task 8: API Documentation (4 hours)

Create comprehensive API documentation using OpenAPI/Swagger.

**Files to Create:**
- `docs/API_REFERENCE.md`
- `docs/WEBHOOK_GUIDE.md`
- `docs/INTEGRATION_EXAMPLES.md`

---

### Task 9: Integration & Testing (4 hours)

**Testing:**
- Webhook delivery success rate >99%
- Calendar sync works correctly
- iCal feeds valid
- Email templates render correctly

**Files to Create:**
- `src/services/webhook.service.test.ts`

---

## 📊 Time Estimates

| Task | Hours | Priority |
|------|-------|----------|
| 1. Webhook Schema | 3 | Critical |
| 2. Webhook Service | 6 | Critical |
| 3. Webhook UI | 5 | High |
| 4. Google Calendar | 5 | High |
| 5. Outlook Calendar | 4 | High |
| 6. iCal Feed | 3 | Medium |
| 7. Email Templates | 4 | Medium |
| 8. API Docs | 4 | Medium |
| 9. Testing | 4 | Critical |
| **TOTAL** | **38 hours** | **~2 weeks** |

**Buffer:** +20% = **46 hours total**

---

## 🎯 Success Metrics

- [ ] Webhook delivery >99% success rate
- [ ] Calendar sync functional
- [ ] iCal feeds valid
- [ ] API documentation complete
- [ ] 211+ tests passing

---

**Document Version:** 1.0  
**Created:** December 7, 2024  
**Sprint:** 9 - Integrations & Automation
