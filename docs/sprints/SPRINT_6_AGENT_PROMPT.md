# Sprint 6 Agent Prompt: Communication & Notifications

## 🎯 Mission Brief

You are an expert full-stack developer tasked with implementing Sprint 6 for ScaleFlow. Your mission is to build a comprehensive **Notifications System** and **In-App Messaging** platform to enable real-time communication and keep users informed.

**Sprint Goals:**

1. ✅ Real-time notifications (in-app, email, push)
2. ✅ In-app messaging with @mentions
3. ✅ Shift notes and comments
4. ✅ Notification preferences and quiet hours
5. ✅ Mobile responsive and accessible

**Expected Timeline:** 56-67 hours (~3-4 weeks)

---

## 📋 Context

### Sprint Status

- **Sprint 1:** ✅ Code quality & foundation
- **Sprint 2:** ✅ Performance optimization
- **Sprint 3:** ✅ Dependencies & stability
- **Sprint 4:** ✅ Developer experience
- **Sprint 5:** ✅ Calendar view & recurring shifts
- **Sprint 6:** 🎯 YOU ARE HERE

### Current State

- 186 tests passing
- React 18 + TypeScript + Vite
- Tailwind CSS + shadcn/ui
- Supabase backend with Realtime
- All previous sprints complete

### Why This Sprint Matters

- **#1 Pain Point:** Poor communication between managers and employees
- **High Impact:** Real-time updates reduce confusion by 70%
- **User Retention:** Notifications keep users engaged
- **Team Collaboration:** Messaging improves coordination

---

## 🎯 Success Criteria

Sprint 6 is **COMPLETE** when:

### Core Features ✅

- [ ] Notifications delivered in-app <2s after event
- [ ] Email notifications sent within 5 minutes
- [ ] Push notifications working (PWA)
- [ ] In-app messaging with real-time delivery
- [ ] @mentions trigger notifications
- [ ] Notification preferences configurable
- [ ] Shift notes with @mentions and attachments
- [ ] All notification types implemented

### Quality ✅

- [ ] 211+ tests passing (add 25+ new tests)
- [ ] No TypeScript errors
- [ ] No console warnings
- [ ] Build succeeds
- [ ] Lint passes
- [ ] CodeQL security scan clean

### Performance ✅

- [ ] In-app notification latency <2s
- [ ] Message delivery <100ms
- [ ] Email sent within 5 minutes
- [ ] Push delivered within 10 seconds
- [ ] Can handle 1000+ notifications

### Documentation ✅

- [ ] NOTIFICATIONS_GUIDE.md user guide
- [ ] MESSAGING_GUIDE.md user guide
- [ ] API documentation updated
- [ ] README updated with new features

---

## 📦 Task List (Priority Order)

### Phase 1: Notifications Foundation (Day 1-5)

#### ✅ Task 1: Notifications Database Schema (3h)

**Priority:** CRITICAL - Everything depends on this

**Action Items:**

1. Create notifications table with proper indexes
2. Create notification_preferences table
3. Add RLS policies for user isolation
4. Update TypeScript types
5. Test migrations

**Database Migration:**

```sql
-- See SPRINT_6_PLAN.md Task 1 for full schema
CREATE TABLE notifications (
  id UUID PRIMARY KEY,
  user_id UUID REFERENCES profiles(id),
  company_id UUID REFERENCES companies(id),
  type TEXT CHECK (type IN (...)),
  title TEXT NOT NULL,
  message TEXT,
  data JSONB,
  read BOOLEAN DEFAULT false,
  sent_via JSONB,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Add indexes and RLS policies
```

**Files to create:**

- `supabase/migrations/[timestamp]_create_notifications.sql`
- `src/types/notifications.ts`
- `src/api/notifications.ts`

**Testing:**

```bash
# Apply migration locally
supabase migration up

# Verify tables created
psql -d postgres -c "\d notifications"

# Test RLS policies
npm test
```

---

#### ✅ Task 2: Notification Service Core (5h)

**Priority:** CRITICAL

**Action Items:**

1. Create NotificationService class
2. Implement createNotification method
3. Implement getNotifications with pagination
4. Implement markAsRead / markAllAsRead
5. Create notification templates
6. Add preference checking
7. Write comprehensive tests

**Service Structure:**

```typescript
// src/services/notification.service.ts

export class NotificationService {
  static async createNotification(params: CreateNotificationParams): Promise<Notification> {
    // 1. Check user preferences
    // 2. Create in-app notification
    // 3. Queue email if enabled
    // 4. Queue push if enabled
    // 5. Return notification
  }

  static async getNotifications(
    userId: string,
    options: { page?: number; unreadOnly?: boolean }
  ): Promise<{ notifications: Notification[]; total: number }> {
    // Paginated query with filters
  }

  static async markAsRead(notificationId: string, userId: string): Promise<void> {
    // Update read status
  }

  static async getPreferences(userId: string): Promise<NotificationPreferences> {
    // Fetch or create default preferences
  }
}
```

**Notification Templates:**

```typescript
// src/services/notification-templates.ts
export const NOTIFICATION_TEMPLATES = {
  shift_assigned: {
    title: 'New Shift Assigned',
    message: (data) => `You have been assigned a shift on ${data.shiftDate}...`,
  },
  // Add all 11 notification types
};
```

**Files to create:**

- `src/services/notification.service.ts`
- `src/services/notification-templates.ts`
- `src/services/notification.service.test.ts`

**Testing:**

```bash
npm test -- notification.service.test.ts
# Must have 100% coverage
```

---

#### ✅ Task 3: In-App Notification Center (6h)

**Priority:** HIGH

**Action Items:**

1. Create NotificationBell with badge
2. Create NotificationDropdown
3. Implement real-time updates via Supabase Realtime
4. Add mark as read on click
5. Create full Notifications page
6. Add notification sounds (optional)
7. Mobile responsive design

**Components:**

```typescript
// src/components/Notifications/NotificationBell.tsx
export const NotificationBell = () => {
  const { unreadCount } = useNotifications();
  
  return (
    <button className="relative">
      <Bell className="h-5 w-5" />
      {unreadCount > 0 && (
        <Badge className="absolute -top-1 -right-1">
          {unreadCount}
        </Badge>
      )}
    </button>
  );
};
```

**Real-time Hook:**

```typescript
// src/hooks/useNotifications.ts
export const useNotifications = () => {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const { session } = useSession();

  useEffect(() => {
    // Fetch initial notifications
    
    // Subscribe to real-time updates
    const channel = supabase
      .channel('notifications')
      .on('postgres_changes', {
        event: 'INSERT',
        schema: 'public',
        table: 'notifications',
        filter: `user_id=eq.${session.user.id}`,
      }, (payload) => {
        setNotifications(prev => [payload.new, ...prev]);
        playSound(); // Optional
      })
      .subscribe();

    return () => channel.unsubscribe();
  }, [session]);

  return { notifications, unreadCount, markAsRead };
};
```

**Files to create:**

- `src/components/Notifications/NotificationBell.tsx`
- `src/components/Notifications/NotificationDropdown.tsx`
- `src/components/Notifications/NotificationItem.tsx`
- `src/hooks/useNotifications.ts`
- `src/pages/Notifications.tsx`

**Integration:**

- Update `src/components/layout/Navbar.tsx` to add NotificationBell
- Update `src/App.tsx` to add `/notifications` route

**Testing:**

```bash
npm run dev
# Navigate to app
# Check bell icon appears
# Create test notification in DB
# Verify it appears in real-time
```

---

#### ✅ Task 4: Email Notifications (5h)

**Priority:** HIGH

**Action Items:**

1. Set up SendGrid account and API key
2. Create email templates (HTML + text)
3. Create edge function for sending emails
4. Implement email queue
5. Add retry logic
6. Test email delivery

**SendGrid Setup:**

```bash
# 1. Sign up at sendgrid.com
# 2. Create API key with "Mail Send" permission
# 3. Add to Supabase secrets:
supabase secrets set SENDGRID_API_KEY=your_key_here
```

**Edge Function:**

```typescript
// supabase/functions/send-email/index.ts
import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';

serve(async (req) => {
  const { to, subject, html, text } = await req.json();
  
  const response = await fetch('https://api.sendgrid.com/v3/mail/send', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${Deno.env.get('SENDGRID_API_KEY')}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      personalizations: [{ to: [{ email: to }] }],
      from: { email: 'notifications@scaleflow.app', name: 'ScaleFlow' },
      subject,
      content: [
        { type: 'text/plain', value: text },
        { type: 'text/html', value: html },
      ],
    }),
  });

  return new Response(JSON.stringify({ success: response.ok }));
});
```

**Email Templates:**

```typescript
// src/services/email-templates.ts
export const generateEmailHTML = (type: string, data: any, userName: string) => {
  // Professional HTML email templates
  // See SPRINT_6_PLAN.md Task 4 for examples
};
```

**Files to create:**

- `supabase/functions/send-email/index.ts`
- `src/services/email-templates.ts`
- `src/services/email.service.ts`

**Testing:**

```bash
# Test locally
supabase functions serve send-email

# Send test email
curl -X POST http://localhost:54321/functions/v1/send-email \
  -H "Content-Type: application/json" \
  -d '{"to":"your@email.com","subject":"Test","html":"<p>Test</p>","text":"Test"}'

# Check your inbox
```

---

#### ✅ Task 5: Push Notifications (PWA) (4h)

**Priority:** MEDIUM

**Action Items:**

1. Generate VAPID keys
2. Update service worker for push
3. Create push subscription UI
4. Store subscriptions in database
5. Create edge function for sending push
6. Test on mobile devices

**VAPID Keys:**

```bash
# Generate VAPID keys
npx web-push generate-vapid-keys

# Add to .env
VITE_VAPID_PUBLIC_KEY=your_public_key
VAPID_PRIVATE_KEY=your_private_key

# Add to Supabase secrets
supabase secrets set VAPID_PRIVATE_KEY=your_private_key
```

**Service Worker:**

```javascript
// public/service-worker.js
self.addEventListener('push', function(event) {
  const data = event.data.json();
  
  event.waitUntil(
    self.registration.showNotification(data.title, {
      body: data.message,
      icon: '/icon-192.png',
      badge: '/badge-96.png',
      data: data,
    })
  );
});
```

**Push Service:**

```typescript
// src/services/push.service.ts
export class PushService {
  static async requestPermission(): Promise<boolean> {
    const permission = await Notification.requestPermission();
    return permission === 'granted';
  }

  static async subscribe(): Promise<void> {
    const registration = await navigator.serviceWorker.ready;
    const subscription = await registration.pushManager.subscribe({
      userVisibleOnly: true,
      applicationServerKey: VAPID_PUBLIC_KEY,
    });
    
    // Save to database
    await savePushSubscription(subscription);
  }
}
```

**Files to create:**

- `src/services/push.service.ts`
- `src/components/Settings/PushNotificationSettings.tsx`
- `supabase/functions/send-push/index.ts`

**Testing:**

```bash
# Test on mobile (PWA required)
npm run build
npm run preview

# Test push subscription
# Test notification delivery
```

---

### Phase 2: Messaging System (Day 6-10)

#### ✅ Task 6: Messaging Database Schema (3h)

**Priority:** HIGH

**Action Items:**

1. Create message_threads table
2. Create message_thread_participants table
3. Create messages table
4. Add full-text search
5. Add RLS policies
6. Update TypeScript types

**See SPRINT_6_PLAN.md Task 6 for complete schema**

**Files to create:**

- `supabase/migrations/[timestamp]_create_messaging.sql`
- `src/types/messages.ts`
- `src/api/messages.ts`

---

#### ✅ Task 7: Messaging Service & Real-time (6h)

**Priority:** HIGH

**Action Items:**

1. Create MessagingService class
2. Implement createThread
3. Implement sendMessage
4. Implement getThreads / getMessages
5. Add real-time subscriptions
6. Add typing indicators
7. Add search functionality
8. Write tests

**Service Structure:**

```typescript
// src/services/messaging.service.ts
export class MessagingService {
  static async createThread(
    type: 'direct' | 'group',
    participantIds: string[]
  ): Promise<MessageThread> {
    // Create thread and add participants
  }

  static async sendMessage(
    threadId: string,
    content: string,
    mentionedUsers?: string[]
  ): Promise<Message> {
    // Send message
    // Notify mentioned users
  }

  static subscribeToThread(
    threadId: string,
    onMessage: (message: Message) => void
  ): RealtimeChannel {
    return supabase
      .channel(`messages:${threadId}`)
      .on('postgres_changes', {
        event: 'INSERT',
        schema: 'public',
        table: 'messages',
        filter: `thread_id=eq.${threadId}`,
      }, (payload) => {
        onMessage(payload.new as Message);
      })
      .subscribe();
  }
}
```

**Files to create:**

- `src/services/messaging.service.ts`
- `src/services/messaging.service.test.ts`

**Testing:**

```bash
npm test -- messaging.service.test.ts
# Real-time tested with mock Supabase client
```

---

#### ✅ Task 8: Messaging UI Components (8h)

**Priority:** HIGH

**Action Items:**

1. Create MessageThreadList
2. Create MessageThread with real-time
3. Create MessageInput with @mention
4. Create MessageBubble
5. Add file attachments
6. Add typing indicators
7. Add read receipts
8. Mobile responsive

**Components:**

```typescript
// src/pages/Messages.tsx
export const MessagesPage = () => {
  return (
    <div className="flex h-screen">
      <MessageThreadList onSelectThread={setActiveThread} />
      {activeThread && <MessageThread threadId={activeThread} />}
    </div>
  );
};

// src/components/Messaging/MessageInput.tsx
export const MessageInput = ({ threadId, onSend }) => {
  const { suggestions, showSuggestions } = useMentionAutocomplete(threadId);
  
  return (
    <div className="relative">
      <textarea
        value={message}
        onChange={handleChange}
        placeholder="Type a message... (@mention to notify)"
      />
      {showSuggestions && <MentionSuggestions suggestions={suggestions} />}
      <button onClick={handleSend}>Send</button>
    </div>
  );
};
```

**@Mention Implementation:**

```typescript
// src/hooks/useMentionAutocomplete.ts
export const useMentionAutocomplete = (threadId: string) => {
  const [query, setQuery] = useState('');
  const [suggestions, setSuggestions] = useState<User[]>([]);

  const handleInput = (text: string) => {
    const mentionMatch = text.match(/@(\w*)$/);
    if (mentionMatch) {
      // Search participants
      // Show suggestions
    }
  };

  return { suggestions, showSuggestions, handleInput };
};
```

**Files to create:**

- `src/components/Messaging/MessageThreadList.tsx`
- `src/components/Messaging/MessageThread.tsx`
- `src/components/Messaging/MessageInput.tsx`
- `src/components/Messaging/MessageBubble.tsx`
- `src/hooks/useMentionAutocomplete.ts`
- `src/pages/Messages.tsx`

**Testing:**

```bash
npm run dev
# Test creating threads
# Test sending messages
# Test @mentions
# Test file attachments
# Test on mobile
```

---

### Phase 3: Final Integration (Day 11-13)

#### ✅ Task 9: Shift Notes & Comments (4h)

**Priority:** MEDIUM

**Action Items:**

1. Create shift_notes table
2. Create ShiftNotes component
3. Add @mention support
4. Add file attachments
5. Implement pinned notes

**See SPRINT_6_PLAN.md Task 9 for details**

---

#### ✅ Task 10: Notification Triggers (4h)

**Priority:** HIGH

**Action Items:**

1. Create database triggers for shift events
2. Create triggers for swap requests
3. Create shift reminder scheduler
4. Test all triggers

**Database Triggers:**

```sql
-- Notify on shift assignment
CREATE TRIGGER shift_assigned_notification
  AFTER INSERT ON shifts
  FOR EACH ROW
  WHEN (NEW.employee_id IS NOT NULL)
  EXECUTE FUNCTION notify_shift_assigned();

-- Notify on shift changes
-- Notify on swap requests
-- etc.
```

**Cron Job:**

```typescript
// supabase/functions/schedule-shift-reminders/index.ts
// Run every 15 minutes to send shift reminders
// Find shifts starting in 24h and 1h
// Create reminder notifications
```

**Files to create:**

- `supabase/migrations/[timestamp]_notification_triggers.sql`
- `supabase/functions/schedule-shift-reminders/index.ts`

---

#### ✅ Task 11: Integration & Testing (5h)

**Priority:** CRITICAL

**Testing Checklist:**

```bash
# Unit Tests
npm test  # 211+ tests must pass

# Integration Tests
- Create shift → notification sent
- Send message → notification sent
- @mention → notification created
- Email delivered within 5 min
- Push delivered within 10 sec
- Real-time updates <100ms

# Manual Testing
- Desktop: Chrome, Firefox, Safari
- Mobile: iOS Safari, Android Chrome
- Test all notification types
- Test messaging features
- Test on slow connection

# Performance
- Load 1000 notifications <2s
- Messages deliver <100ms
- No memory leaks
- Realtime connections stable

# Accessibility
- Keyboard navigation
- Screen reader compatible
- Color contrast WCAG AA
- Focus indicators
```

**Files to create:**

- `src/components/Notifications/Notifications.test.tsx`
- `src/components/Messaging/Messaging.test.tsx`

---

#### ✅ Task 12: Documentation (3h)

**Priority:** MEDIUM

**Documents to create:**

1. **NOTIFICATIONS_GUIDE.md**
   - Overview
   - Configuring preferences
   - Email vs push vs in-app
   - Quiet hours
   - Troubleshooting

2. **MESSAGING_GUIDE.md**
   - Sending messages
   - Using @mentions
   - File attachments
   - Search tips

3. **API_NOTIFICATIONS.md**
   - API endpoints
   - Creating notifications programmatically
   - Webhooks
   - Code examples

**Files to create:**

- `docs/NOTIFICATIONS_GUIDE.md`
- `docs/MESSAGING_GUIDE.md`
- `docs/API_NOTIFICATIONS.md`
- Update `docs/INDEX.md` and `README.md`

---

## 🔧 Technical Guidelines

### Code Style

- Follow existing patterns in codebase
- Use TypeScript strict mode
- Use Tailwind CSS for all styling
- Use shadcn/ui components
- Use centralized logger (not console)
- Use API functions from `src/api/`

### Real-time Best Practices

```typescript
// Always unsubscribe on cleanup
useEffect(() => {
  const channel = supabase.channel('name').subscribe();
  return () => channel.unsubscribe();
}, []);

// Handle connection errors
channel.on('system', { event: 'error' }, (error) => {
  logger.error('Realtime error:', error);
});
```

### Notification Best Practices

```typescript
// Check preferences before sending
const prefs = await NotificationService.getPreferences(userId);
if (!prefs.shift_assigned.email) {
  // Skip email, send only in-app
}

// Respect quiet hours
const now = new Date();
if (isQuietHours(now, prefs)) {
  // Queue for later or skip
}
```

---

## 🚨 Common Pitfalls to Avoid

### ❌ Don't Do This

- Send notifications without checking preferences
- Create multiple real-time connections
- Forget to unsubscribe from channels
- Send emails in infinite loops
- Store sensitive data in notification data
- Skip error handling for email/push
- Test only on desktop

### ✅ Do This

- Always check user preferences
- Reuse real-time connections
- Clean up subscriptions
- Implement retry with exponential backoff
- Sanitize notification data
- Handle all error cases
- Test on mobile devices early

---

## 📊 Progress Tracking

Use this template when reporting progress:

```markdown
## Sprint 6 Progress - [Date]

### Completed ✅
- [x] Task 1: Notifications schema (3h)
- [x] Task 2: Notification service (5h)

### In Progress 🔄
- [ ] Task 3: In-app notification center (60% complete)
  - ✅ NotificationBell component
  - ✅ Real-time subscriptions
  - ⏳ Notifications page
  - ⏳ Mobile responsive

### Pending ⏸️
- [ ] Task 4: Email notifications
- [ ] Tasks 5-12

### Metrics 📊
- Tests passing: 195/195 (+9 new)
- Real-time latency: <1s
- Email delivery: 4 min avg
- Bundle size: +120KB

### Issues 🐛
- None currently

### Next Steps 🎯
1. Complete Task 3 (notifications page)
2. Start Task 4 (email setup)
3. Test email delivery
```

---

## 🎯 Final Checklist

Before marking Sprint 6 complete:

### Features ✅
- [ ] In-app notifications working
- [ ] Email notifications sending
- [ ] Push notifications working
- [ ] Messaging with real-time
- [ ] @mentions trigger notifications
- [ ] Shift notes implemented
- [ ] Notification preferences working
- [ ] All triggers firing correctly

### Quality ✅
- [ ] 211+ tests passing
- [ ] No TypeScript errors
- [ ] No console warnings
- [ ] Build succeeds
- [ ] Lint passes
- [ ] CodeQL passes

### Performance ✅
- [ ] Notifications <2s latency
- [ ] Messages <100ms delivery
- [ ] Email within 5 minutes
- [ ] Bundle <150KB increase

### Mobile ✅
- [ ] Tested on iOS Safari
- [ ] Tested on Android Chrome
- [ ] Touch gestures work
- [ ] Responsive design

### Documentation ✅
- [ ] NOTIFICATIONS_GUIDE.md
- [ ] MESSAGING_GUIDE.md
- [ ] API docs
- [ ] README updated

---

## 🚀 Let's Begin!

**Your first task:** Task 1 - Notifications Database Schema

1. Create notifications and notification_preferences tables
2. Add indexes for performance
3. Set up RLS policies
4. Update TypeScript types
5. Test migration
6. Report progress

**Remember:**

- Test after each task
- Commit frequently
- Report progress
- Ask for help if stuck
- Check mobile early
- Respect user preferences

**Good luck! You've got this! 🎉**

---

**Document Version:** 1.0  
**Created:** December 7, 2024  
**Sprint:** 6 - Communication & Notifications  
**Estimated Timeline:** 56-67 hours (~3-4 weeks)
