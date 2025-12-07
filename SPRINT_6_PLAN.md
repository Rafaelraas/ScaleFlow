# Sprint 6: Communication & Notifications

**Sprint Duration:** Week 8-10 (estimated 3-4 weeks)  
**Status:** 📋 Planned  
**Priority:** Critical 🔴  
**Main Goals:**

1. Comprehensive Notifications System
2. In-App Messaging for team communication
3. Shift Notes & Comments

---

## 📋 Executive Summary

Sprint 6 focuses on enabling real-time communication between managers and employees through a robust notifications system and in-app messaging. This sprint delivers essential features that keep everyone informed and connected, significantly improving team coordination.

**Expected Impact:**

- 95%+ notification delivery rate
- 80%+ email open rate for important notifications
- 70%+ daily active messaging users
- 50% reduction in miscommunication issues

---

## 🎯 Sprint Objectives

### Primary Goals

1. **Notifications System** (P1 - Critical)
   - Real-time in-app notifications
   - Email notifications for important events
   - Push notifications (PWA)
   - Configurable notification preferences
   - Notification history and management

2. **In-App Messaging** (P2 - High)
   - One-on-one direct messaging
   - Team announcements
   - Message threads and @mentions
   - File attachments
   - Real-time delivery with read receipts

3. **Shift Notes & Comments** (P3 - Medium)
   - Collaborative shift notes
   - Comment threads on shifts
   - @mention colleagues for visibility
   - File attachments for documents
   - Search and history

### Success Criteria

- [ ] Notifications delivered in <2s
- [ ] 95%+ notification delivery success rate
- [ ] Email notifications sent within 5 minutes
- [ ] Messages delivered in <100ms
- [ ] 70%+ users adopt messaging within first month
- [ ] 186+ tests passing (add 25+ new tests)
- [ ] Mobile responsive on all features
- [ ] Documentation complete

---

## 📦 Task Breakdown

### Task 1: Notifications Database Schema (3 hours)

**Priority:** Critical  
**Blockers:** None

**Subtasks:**

1. Design notifications table schema
2. Design notification preferences table
3. Create database migrations
4. Add indexes for performance
5. Set up RLS policies
6. Update TypeScript types

**Database Schema:**

```sql
-- Notifications table
CREATE TABLE notifications (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES profiles(id) NOT NULL,
  company_id UUID REFERENCES companies(id) NOT NULL,
  type TEXT NOT NULL CHECK (type IN (
    'shift_assigned', 'shift_changed', 'shift_cancelled',
    'swap_requested', 'swap_approved', 'swap_rejected',
    'preference_reviewed', 'schedule_published',
    'shift_reminder', 'time_off_response', 'message_received'
  )),
  title TEXT NOT NULL,
  message TEXT,
  data JSONB DEFAULT '{}'::jsonb,
  read BOOLEAN DEFAULT false,
  read_at TIMESTAMP,
  sent_via JSONB DEFAULT '{"in_app": true, "email": false, "push": false}'::jsonb,
  created_at TIMESTAMP DEFAULT NOW(),
  expires_at TIMESTAMP
);

CREATE INDEX idx_notifications_user_unread 
  ON notifications(user_id, read) 
  WHERE read = false;

CREATE INDEX idx_notifications_created 
  ON notifications(user_id, created_at DESC);

-- Notification preferences
CREATE TABLE notification_preferences (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES profiles(id) UNIQUE NOT NULL,
  shift_assigned JSONB DEFAULT '{"in_app": true, "email": true, "push": true}'::jsonb,
  shift_changed JSONB DEFAULT '{"in_app": true, "email": true, "push": true}'::jsonb,
  shift_cancelled JSONB DEFAULT '{"in_app": true, "email": true, "push": true}'::jsonb,
  swap_requested JSONB DEFAULT '{"in_app": true, "email": true, "push": false}'::jsonb,
  swap_approved JSONB DEFAULT '{"in_app": true, "email": true, "push": true}'::jsonb,
  swap_rejected JSONB DEFAULT '{"in_app": true, "email": true, "push": false}'::jsonb,
  schedule_published JSONB DEFAULT '{"in_app": true, "email": true, "push": true}'::jsonb,
  shift_reminder JSONB DEFAULT '{"in_app": true, "email": false, "push": true}'::jsonb,
  quiet_hours_enabled BOOLEAN DEFAULT false,
  quiet_hours_start TIME,
  quiet_hours_end TIME,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- RLS Policies
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE notification_preferences ENABLE ROW LEVEL SECURITY;

-- Users can only see their own notifications
CREATE POLICY notifications_select_own 
  ON notifications FOR SELECT 
  USING (auth.uid() = user_id);

CREATE POLICY notifications_update_own 
  ON notifications FOR UPDATE 
  USING (auth.uid() = user_id);

-- Users can only manage their own preferences
CREATE POLICY notification_preferences_all_own 
  ON notification_preferences 
  USING (auth.uid() = user_id);
```

**Acceptance Criteria:**

- Migration runs successfully
- All tables created with indexes
- RLS policies enforce user isolation
- TypeScript types match schema
- No breaking changes

**Files to Create/Modify:**

- `supabase/migrations/[timestamp]_create_notifications.sql` (new)
- `src/types/notifications.ts` (new)
- `src/api/notifications.ts` (new - stub)

---

### Task 2: Notification Service Core (5 hours)

**Priority:** Critical  
**Dependencies:** Task 1

**Subtasks:**

1. Create NotificationService class
2. Implement createNotification method
3. Implement getNotifications with pagination
4. Implement markAsRead functionality
5. Implement markAllAsRead
6. Implement deleteNotification
7. Add notification templates
8. Write comprehensive tests

**Service Implementation:**

```typescript
// src/services/notification.service.ts

export interface CreateNotificationParams {
  userId: string;
  companyId: string;
  type: NotificationType;
  title: string;
  message?: string;
  data?: Record<string, any>;
  sendVia?: {
    inApp?: boolean;
    email?: boolean;
    push?: boolean;
  };
}

export class NotificationService {
  /**
   * Create a new notification
   */
  static async createNotification(params: CreateNotificationParams): Promise<Notification> {
    // Check user's notification preferences
    // Create in-app notification
    // Queue email if enabled
    // Queue push notification if enabled
    // Return created notification
  }

  /**
   * Get paginated notifications for user
   */
  static async getNotifications(
    userId: string,
    options: { page?: number; perPage?: number; unreadOnly?: boolean }
  ): Promise<{ notifications: Notification[]; total: number }> {
    // Query with pagination
    // Filter by unread if requested
    // Return results with count
  }

  /**
   * Mark notification as read
   */
  static async markAsRead(notificationId: string, userId: string): Promise<void> {
    // Update read status
    // Set read_at timestamp
  }

  /**
   * Mark all notifications as read
   */
  static async markAllAsRead(userId: string): Promise<void> {
    // Bulk update all unread notifications
  }

  /**
   * Delete notification
   */
  static async deleteNotification(notificationId: string, userId: string): Promise<void> {
    // Soft delete or hard delete based on strategy
  }

  /**
   * Get notification preferences
   */
  static async getPreferences(userId: string): Promise<NotificationPreferences> {
    // Fetch user preferences
    // Return defaults if none exist
  }

  /**
   * Update notification preferences
   */
  static async updatePreferences(
    userId: string,
    preferences: Partial<NotificationPreferences>
  ): Promise<void> {
    // Upsert preferences
  }
}
```

**Notification Templates:**

```typescript
// src/services/notification-templates.ts

export const NOTIFICATION_TEMPLATES = {
  shift_assigned: {
    title: 'New Shift Assigned',
    message: (data: { shiftDate: string; startTime: string; endTime: string }) =>
      `You have been assigned a shift on ${data.shiftDate} from ${data.startTime} to ${data.endTime}`,
  },
  shift_changed: {
    title: 'Shift Updated',
    message: (data: { shiftDate: string }) =>
      `Your shift on ${data.shiftDate} has been updated. Please review the changes.`,
  },
  shift_cancelled: {
    title: 'Shift Cancelled',
    message: (data: { shiftDate: string }) =>
      `Your shift on ${data.shiftDate} has been cancelled.`,
  },
  swap_requested: {
    title: 'Shift Swap Request',
    message: (data: { requesterName: string; shiftDate: string }) =>
      `${data.requesterName} wants to swap shifts with you on ${data.shiftDate}`,
  },
  swap_approved: {
    title: 'Swap Request Approved',
    message: (data: { shiftDate: string }) =>
      `Your shift swap request for ${data.shiftDate} has been approved.`,
  },
  schedule_published: {
    title: 'New Schedule Published',
    message: (data: { weekStart: string; weekEnd: string }) =>
      `The schedule for ${data.weekStart} - ${data.weekEnd} is now available.`,
  },
  shift_reminder: {
    title: 'Upcoming Shift Reminder',
    message: (data: { hours: number; shiftTime: string }) =>
      `Your shift starts in ${data.hours} hour${data.hours > 1 ? 's' : ''} at ${data.shiftTime}`,
  },
};
```

**Acceptance Criteria:**

- Service methods work correctly
- Respects user notification preferences
- Error handling implemented
- 100% test coverage for service
- TypeScript types are correct

**Files to Create/Modify:**

- `src/services/notification.service.ts` (new)
- `src/services/notification-templates.ts` (new)
- `src/services/notification.service.test.ts` (new)
- `src/api/notifications.ts` (update)

---

### Task 3: In-App Notification Center (6 hours)

**Priority:** High  
**Dependencies:** Task 2

**Subtasks:**

1. Create NotificationBell component with badge
2. Create NotificationDropdown with list
3. Create NotificationItem component
4. Implement real-time updates with Supabase Realtime
5. Add mark as read on click
6. Add mark all as read button
7. Add "View All" link to notifications page
8. Create full Notifications page
9. Add notification sounds (optional)
10. Mobile responsive design

**UI Components:**

```typescript
// src/components/Notifications/NotificationBell.tsx
export const NotificationBell = () => {
  const [unreadCount, setUnreadCount] = useState(0);
  
  // Subscribe to real-time updates
  // Show badge with count
  // Open dropdown on click
};

// src/components/Notifications/NotificationDropdown.tsx
export const NotificationDropdown = () => {
  // Display recent 10 notifications
  // Mark as read on item click
  // "Mark all as read" button
  // "View all" link
};

// src/components/Notifications/NotificationItem.tsx
export const NotificationItem = ({ notification }) => {
  // Display notification content
  // Show time ago
  // Show read/unread indicator
  // Click to mark as read and navigate
};

// src/pages/Notifications.tsx
export const NotificationsPage = () => {
  // Full list with pagination
  // Filter by read/unread
  // Search notifications
  // Bulk actions
};
```

**Real-time Implementation:**

```typescript
// src/hooks/useNotifications.ts
export const useNotifications = () => {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    // Fetch initial notifications
    
    // Subscribe to real-time updates
    const channel = supabase
      .channel('notifications')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'notifications',
          filter: `user_id=eq.${userId}`,
        },
        (payload) => {
          // Add new notification
          // Play sound if enabled
          // Show toast
        }
      )
      .subscribe();

    return () => {
      channel.unsubscribe();
    };
  }, []);

  return { notifications, unreadCount, markAsRead, markAllAsRead };
};
```

**Acceptance Criteria:**

- Notification bell shows unread count
- Dropdown displays recent notifications
- Real-time updates work smoothly
- Mark as read functionality works
- Full notifications page with pagination
- Mobile responsive
- Accessible (keyboard navigation, ARIA)

**Files to Create/Modify:**

- `src/components/Notifications/NotificationBell.tsx` (new)
- `src/components/Notifications/NotificationDropdown.tsx` (new)
- `src/components/Notifications/NotificationItem.tsx` (new)
- `src/hooks/useNotifications.ts` (new)
- `src/pages/Notifications.tsx` (new)
- `src/components/layout/Navbar.tsx` (update - add bell)
- `src/App.tsx` (update - add route)

---

### Task 4: Email Notifications (5 hours)

**Priority:** High  
**Dependencies:** Task 2

**Subtasks:**

1. Set up email service (SendGrid or AWS SES)
2. Create email templates (HTML + text)
3. Implement email queue system
4. Create edge function for sending emails
5. Add retry logic for failed sends
6. Implement email logging
7. Create email preferences UI
8. Test with real email

**Email Service Setup:**

```typescript
// supabase/functions/send-email/index.ts

import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';

const SENDGRID_API_KEY = Deno.env.get('SENDGRID_API_KEY');

serve(async (req) => {
  const { to, subject, html, text } = await req.json();

  const response = await fetch('https://api.sendgrid.com/v3/mail/send', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${SENDGRID_API_KEY}`,
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

  return new Response(JSON.stringify({ success: response.ok }), {
    headers: { 'Content-Type': 'application/json' },
  });
});
```

**Email Templates:**

```typescript
// src/services/email-templates.ts

export const generateEmailHTML = (
  notificationType: string,
  data: any,
  userName: string
): { html: string; text: string } => {
  const templates = {
    shift_assigned: {
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <style>
            body { font-family: Arial, sans-serif; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .button { background: #3b82f6; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; }
          </style>
        </head>
        <body>
          <div class="container">
            <h2>New Shift Assigned</h2>
            <p>Hi ${userName},</p>
            <p>You have been assigned a new shift:</p>
            <ul>
              <li>Date: ${data.shiftDate}</li>
              <li>Time: ${data.startTime} - ${data.endTime}</li>
              <li>Location: ${data.location || 'N/A'}</li>
            </ul>
            <p><a href="${data.viewUrl}" class="button">View Shift</a></p>
            <p>Best regards,<br>The ScaleFlow Team</p>
          </div>
        </body>
        </html>
      `,
      text: `Hi ${userName},\n\nYou have been assigned a new shift on ${data.shiftDate} from ${data.startTime} to ${data.endTime}.\n\nView shift: ${data.viewUrl}\n\nBest regards,\nThe ScaleFlow Team`,
    },
    // Add more templates for each notification type
  };

  return templates[notificationType] || { html: '', text: '' };
};
```

**Acceptance Criteria:**

- Email service configured and working
- All notification types have email templates
- Emails sent within 5 minutes of notification
- Retry logic handles failures
- Email logging tracks delivery status
- Users can configure email preferences
- Test emails received successfully

**Files to Create/Modify:**

- `supabase/functions/send-email/index.ts` (new)
- `src/services/email-templates.ts` (new)
- `src/services/email.service.ts` (new)
- `src/components/Settings/EmailPreferences.tsx` (new)

---

### Task 5: Push Notifications (PWA) (4 hours)

**Priority:** Medium  
**Dependencies:** Task 2

**Subtasks:**

1. Configure service worker for push
2. Implement push subscription
3. Create push notification handler
4. Add push permission request UI
5. Store push subscriptions in database
6. Create edge function for sending push
7. Add push to notification service
8. Test on mobile devices

**Service Worker:**

```typescript
// public/service-worker.js

self.addEventListener('push', function(event) {
  const data = event.data.json();
  
  const options = {
    body: data.message,
    icon: '/icon-192.png',
    badge: '/badge-96.png',
    data: data,
    actions: [
      { action: 'view', title: 'View' },
      { action: 'dismiss', title: 'Dismiss' }
    ]
  };

  event.waitUntil(
    self.registration.showNotification(data.title, options)
  );
});

self.addEventListener('notificationclick', function(event) {
  event.notification.close();
  
  if (event.action === 'view') {
    event.waitUntil(
      clients.openWindow(event.notification.data.url)
    );
  }
});
```

**Push Subscription Management:**

```typescript
// src/services/push.service.ts

export class PushService {
  static async requestPermission(): Promise<boolean> {
    if (!('Notification' in window)) {
      return false;
    }

    const permission = await Notification.requestPermission();
    return permission === 'granted';
  }

  static async subscribe(): Promise<PushSubscription | null> {
    if (!('serviceWorker' in navigator)) {
      return null;
    }

    const registration = await navigator.serviceWorker.ready;
    const subscription = await registration.pushManager.subscribe({
      userVisibleOnly: true,
      applicationServerKey: PUBLIC_VAPID_KEY,
    });

    // Save subscription to database
    await this.saveSubscription(subscription);

    return subscription;
  }

  static async unsubscribe(): Promise<void> {
    const registration = await navigator.serviceWorker.ready;
    const subscription = await registration.pushManager.getSubscription();
    
    if (subscription) {
      await subscription.unsubscribe();
      await this.removeSubscription(subscription);
    }
  }
}
```

**Acceptance Criteria:**

- Service worker handles push notifications
- Permission request UI is user-friendly
- Push subscriptions stored in database
- Push notifications sent successfully
- Works on mobile browsers (PWA)
- Notification actions work correctly
- Users can enable/disable push

**Files to Create/Modify:**

- `public/service-worker.js` (update)
- `src/services/push.service.ts` (new)
- `src/components/Settings/PushNotificationSettings.tsx` (new)
- `supabase/functions/send-push/index.ts` (new)

---

### Task 6: Messaging Database Schema (3 hours)

**Priority:** High  
**Blockers:** None

**Subtasks:**

1. Design message threads schema
2. Design messages schema
3. Design message participants schema
4. Create database migrations
5. Add indexes for performance
6. Set up RLS policies
7. Update TypeScript types

**Database Schema:**

```sql
-- Message threads
CREATE TABLE message_threads (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  type TEXT CHECK (type IN ('direct', 'group', 'announcement')) NOT NULL,
  company_id UUID REFERENCES companies(id) NOT NULL,
  title TEXT,
  created_by UUID REFERENCES profiles(id) NOT NULL,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Message thread participants
CREATE TABLE message_thread_participants (
  thread_id UUID REFERENCES message_threads(id) ON DELETE CASCADE,
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  last_read_at TIMESTAMP,
  joined_at TIMESTAMP DEFAULT NOW(),
  PRIMARY KEY (thread_id, user_id)
);

-- Messages
CREATE TABLE messages (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  thread_id UUID REFERENCES message_threads(id) ON DELETE CASCADE NOT NULL,
  sender_id UUID REFERENCES profiles(id) NOT NULL,
  content TEXT NOT NULL,
  attachments JSONB DEFAULT '[]'::jsonb,
  mentioned_users UUID[],
  edited BOOLEAN DEFAULT false,
  edited_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Indexes
CREATE INDEX idx_message_threads_company ON message_threads(company_id, updated_at DESC);
CREATE INDEX idx_message_participants_user ON message_thread_participants(user_id);
CREATE INDEX idx_messages_thread ON messages(thread_id, created_at);
CREATE INDEX idx_messages_mentions ON messages USING GIN(mentioned_users);

-- Full-text search
ALTER TABLE messages ADD COLUMN search_vector tsvector;
CREATE INDEX idx_messages_search ON messages USING GIN(search_vector);

CREATE OR REPLACE FUNCTION messages_search_trigger() RETURNS trigger AS $$
BEGIN
  NEW.search_vector := to_tsvector('english', COALESCE(NEW.content, ''));
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER messages_search_update 
  BEFORE INSERT OR UPDATE ON messages
  FOR EACH ROW EXECUTE FUNCTION messages_search_trigger();

-- RLS Policies
ALTER TABLE message_threads ENABLE ROW LEVEL SECURITY;
ALTER TABLE message_thread_participants ENABLE ROW LEVEL SECURITY;
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;

-- Users can only access threads they're part of
CREATE POLICY message_threads_access 
  ON message_threads FOR SELECT
  USING (
    id IN (
      SELECT thread_id FROM message_thread_participants 
      WHERE user_id = auth.uid()
    )
  );

CREATE POLICY message_participants_access 
  ON message_thread_participants FOR SELECT
  USING (
    thread_id IN (
      SELECT thread_id FROM message_thread_participants 
      WHERE user_id = auth.uid()
    )
  );

CREATE POLICY messages_access 
  ON messages FOR SELECT
  USING (
    thread_id IN (
      SELECT thread_id FROM message_thread_participants 
      WHERE user_id = auth.uid()
    )
  );

-- Users can send messages to threads they're in
CREATE POLICY messages_insert 
  ON messages FOR INSERT
  WITH CHECK (
    sender_id = auth.uid() AND
    thread_id IN (
      SELECT thread_id FROM message_thread_participants 
      WHERE user_id = auth.uid()
    )
  );
```

**Acceptance Criteria:**

- Migration runs successfully
- All tables and indexes created
- RLS policies enforce access control
- Full-text search works
- TypeScript types match schema
- No breaking changes

**Files to Create/Modify:**

- `supabase/migrations/[timestamp]_create_messaging.sql` (new)
- `src/types/messages.ts` (new)
- `src/api/messages.ts` (new - stub)

---

### Task 7: Messaging Service & Real-time (6 hours)

**Priority:** High  
**Dependencies:** Task 6

**Subtasks:**

1. Create MessagingService class
2. Implement createThread method
3. Implement sendMessage method
4. Implement getThreads with pagination
5. Implement getMessages with pagination
6. Implement markThreadAsRead
7. Implement searchMessages
8. Set up real-time subscriptions
9. Add typing indicators
10. Write comprehensive tests

**Service Implementation:**

```typescript
// src/services/messaging.service.ts

export class MessagingService {
  /**
   * Create a new message thread
   */
  static async createThread(
    type: 'direct' | 'group' | 'announcement',
    participantIds: string[],
    title?: string
  ): Promise<MessageThread> {
    // Create thread
    // Add participants
    // Return thread
  }

  /**
   * Send a message
   */
  static async sendMessage(
    threadId: string,
    content: string,
    attachments?: File[],
    mentionedUsers?: string[]
  ): Promise<Message> {
    // Upload attachments if any
    // Create message with mentions
    // Notify mentioned users
    // Return message
  }

  /**
   * Get user's message threads
   */
  static async getThreads(
    userId: string,
    page: number = 1
  ): Promise<{ threads: MessageThread[]; total: number }> {
    // Get threads with last message
    // Calculate unread count per thread
    // Order by last activity
  }

  /**
   * Get messages for a thread
   */
  static async getMessages(
    threadId: string,
    page: number = 1
  ): Promise<{ messages: Message[]; total: number }> {
    // Get paginated messages
    // Include sender info
    // Mark as read
  }

  /**
   * Mark thread as read
   */
  static async markThreadAsRead(threadId: string, userId: string): Promise<void> {
    // Update last_read_at
  }

  /**
   * Search messages
   */
  static async searchMessages(
    query: string,
    threadId?: string
  ): Promise<Message[]> {
    // Full-text search
    // Highlight matches
  }

  /**
   * Subscribe to real-time messages
   */
  static subscribeToThread(
    threadId: string,
    onMessage: (message: Message) => void
  ): RealtimeChannel {
    const channel = supabase
      .channel(`messages:${threadId}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'messages',
          filter: `thread_id=eq.${threadId}`,
        },
        (payload) => {
          onMessage(payload.new as Message);
        }
      )
      .subscribe();

    return channel;
  }

  /**
   * Send typing indicator
   */
  static sendTypingIndicator(threadId: string, userId: string): void {
    supabase.channel(`typing:${threadId}`).send({
      type: 'broadcast',
      event: 'typing',
      payload: { userId, timestamp: new Date() },
    });
  }
}
```

**Acceptance Criteria:**

- Service methods work correctly
- Real-time messaging is instant (<100ms)
- Typing indicators work smoothly
- File attachments upload successfully
- Message search returns relevant results
- @mentions create notifications
- 100% test coverage for service

**Files to Create/Modify:**

- `src/services/messaging.service.ts` (new)
- `src/services/messaging.service.test.ts` (new)
- `src/api/messages.ts` (update)

---

### Task 8: Messaging UI Components (8 hours)

**Priority:** High  
**Dependencies:** Task 7

**Subtasks:**

1. Create MessageThreadList component
2. Create MessageThread component
3. Create MessageInput component
4. Create MessageBubble component
5. Implement @mention autocomplete
6. Add file upload and preview
7. Add typing indicators
8. Create read receipts
9. Add message search UI
10. Mobile responsive design
11. Keyboard shortcuts (Enter to send, etc.)

**UI Components:**

```typescript
// src/components/Messaging/MessageThreadList.tsx
export const MessageThreadList = () => {
  // Display list of threads
  // Show last message preview
  // Show unread count badge
  // Sort by most recent
  // Search threads
};

// src/components/Messaging/MessageThread.tsx
export const MessageThread = ({ threadId }) => {
  // Display messages in thread
  // Real-time message updates
  // Infinite scroll for history
  // Show typing indicators
  // Mark as read when viewing
};

// src/components/Messaging/MessageInput.tsx
export const MessageInput = ({ threadId, onSend }) => {
  // Text input with auto-resize
  // @mention autocomplete
  // File attachment button
  // Send button
  // Keyboard shortcuts
  // Typing indicator on input
};

// src/components/Messaging/MessageBubble.tsx
export const MessageBubble = ({ message, isSender }) => {
  // Display message content
  // Show sender info if not sender
  // Show timestamp
  // Show read receipts
  // Show attachments
  // Highlight @mentions
};
```

**@Mention Implementation:**

```typescript
// src/hooks/useMentionAutocomplete.ts
export const useMentionAutocomplete = (threadId: string) => {
  const [query, setQuery] = useState('');
  const [suggestions, setSuggestions] = useState<User[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);

  const handleInput = (text: string) => {
    // Detect @ symbol
    const mentionMatch = text.match(/@(\w*)$/);
    
    if (mentionMatch) {
      const searchQuery = mentionMatch[1];
      // Search thread participants
      // Show autocomplete
    } else {
      setShowSuggestions(false);
    }
  };

  return { suggestions, showSuggestions, handleInput };
};
```

**Acceptance Criteria:**

- Thread list shows conversations
- Messages display in real-time
- @mention autocomplete works
- File attachments upload and display
- Typing indicators appear correctly
- Read receipts show accurately
- Search functionality works
- Mobile responsive and touch-friendly
- Keyboard accessible

**Files to Create/Modify:**

- `src/components/Messaging/MessageThreadList.tsx` (new)
- `src/components/Messaging/MessageThread.tsx` (new)
- `src/components/Messaging/MessageInput.tsx` (new)
- `src/components/Messaging/MessageBubble.tsx` (new)
- `src/hooks/useMentionAutocomplete.ts` (new)
- `src/pages/Messages.tsx` (new)
- `src/App.tsx` (update - add route)

---

### Task 9: Shift Notes & Comments (4 hours)

**Priority:** Medium  
**Dependencies:** Task 7 (for @mentions)

**Subtasks:**

1. Create shift_notes table migration
2. Create ShiftNotes component
3. Implement add/edit/delete notes
4. Add @mention support
5. Add file attachments
6. Implement pinned notes
7. Create note history
8. Add search functionality

**Database Schema:**

```sql
CREATE TABLE shift_notes (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  shift_id UUID REFERENCES shifts(id) ON DELETE CASCADE NOT NULL,
  author_id UUID REFERENCES profiles(id) NOT NULL,
  content TEXT NOT NULL,
  mentioned_users UUID[],
  attachments JSONB DEFAULT '[]'::jsonb,
  pinned BOOLEAN DEFAULT false,
  edited BOOLEAN DEFAULT false,
  edited_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_shift_notes_shift ON shift_notes(shift_id, created_at DESC);
CREATE INDEX idx_shift_notes_mentions ON shift_notes USING GIN(mentioned_users);

-- RLS Policies
ALTER TABLE shift_notes ENABLE ROW LEVEL SECURITY;

CREATE POLICY shift_notes_select 
  ON shift_notes FOR SELECT
  USING (
    shift_id IN (
      SELECT id FROM shifts WHERE company_id IN (
        SELECT company_id FROM profiles WHERE id = auth.uid()
      )
    )
  );

CREATE POLICY shift_notes_insert 
  ON shift_notes FOR INSERT
  WITH CHECK (author_id = auth.uid());

CREATE POLICY shift_notes_update 
  ON shift_notes FOR UPDATE
  USING (author_id = auth.uid());
```

**UI Component:**

```typescript
// src/components/Shifts/ShiftNotes.tsx
export const ShiftNotes = ({ shiftId }) => {
  const [notes, setNotes] = useState<ShiftNote[]>([]);
  const [newNote, setNewNote] = useState('');

  const handleAddNote = async () => {
    // Create note with @mentions
    // Notify mentioned users
    // Add to list
  };

  return (
    <div className="shift-notes">
      <div className="notes-header">
        <h3>Notes & Comments</h3>
        <button onClick={() => setShowPinned(!showPinned)}>
          Show Pinned Only
        </button>
      </div>
      
      <div className="notes-list">
        {notes.map(note => (
          <NoteItem key={note.id} note={note} />
        ))}
      </div>
      
      <NoteInput 
        value={newNote}
        onChange={setNewNote}
        onSubmit={handleAddNote}
      />
    </div>
  );
};
```

**Acceptance Criteria:**

- Notes can be added to shifts
- @mentions notify users
- Files can be attached
- Notes can be pinned
- Edit/delete for own notes
- Note history visible
- Search works across notes
- Mobile responsive

**Files to Create/Modify:**

- `supabase/migrations/[timestamp]_create_shift_notes.sql` (new)
- `src/components/Shifts/ShiftNotes.tsx` (new)
- `src/components/Shifts/NoteItem.tsx` (new)
- `src/types/shift-notes.ts` (new)
- `src/api/shift-notes.ts` (new)

---

### Task 10: Notification Triggers (4 hours)

**Priority:** High  
**Dependencies:** Task 2

**Subtasks:**

1. Create notification triggers for shift events
2. Create triggers for swap request events
3. Create triggers for schedule publishing
4. Create shift reminder scheduler
5. Set up edge function for scheduled notifications
6. Test all notification triggers
7. Add logging for debugging

**Database Triggers:**

```sql
-- Trigger on shift assignment
CREATE OR REPLACE FUNCTION notify_shift_assigned() RETURNS trigger AS $$
BEGIN
  INSERT INTO notifications (user_id, company_id, type, title, message, data)
  VALUES (
    NEW.employee_id,
    NEW.company_id,
    'shift_assigned',
    'New Shift Assigned',
    'You have been assigned a new shift',
    jsonb_build_object(
      'shiftId', NEW.id,
      'shiftDate', NEW.start_time::date,
      'startTime', NEW.start_time::time,
      'endTime', NEW.end_time::time
    )
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER shift_assigned_notification
  AFTER INSERT ON shifts
  FOR EACH ROW
  WHEN (NEW.employee_id IS NOT NULL)
  EXECUTE FUNCTION notify_shift_assigned();

-- Trigger on shift update
CREATE OR REPLACE FUNCTION notify_shift_changed() RETURNS trigger AS $$
BEGIN
  IF OLD.employee_id IS NOT NULL AND (
    OLD.start_time != NEW.start_time OR 
    OLD.end_time != NEW.end_time
  ) THEN
    INSERT INTO notifications (user_id, company_id, type, title, message, data)
    VALUES (
      NEW.employee_id,
      NEW.company_id,
      'shift_changed',
      'Shift Updated',
      'Your shift has been modified',
      jsonb_build_object(
        'shiftId', NEW.id,
        'shiftDate', NEW.start_time::date
      )
    );
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER shift_changed_notification
  AFTER UPDATE ON shifts
  FOR EACH ROW
  EXECUTE FUNCTION notify_shift_changed();
```

**Shift Reminder Scheduler:**

```typescript
// supabase/functions/schedule-shift-reminders/index.ts

import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

serve(async (req) => {
  const supabase = createClient(
    Deno.env.get('SUPABASE_URL')!,
    Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
  );

  // Find shifts starting in 24 hours and 1 hour
  const now = new Date();
  const in24Hours = new Date(now.getTime() + 24 * 60 * 60 * 1000);
  const in1Hour = new Date(now.getTime() + 60 * 60 * 1000);

  // Create reminders for upcoming shifts
  // This edge function should be called via cron every 15 minutes

  return new Response(JSON.stringify({ success: true }), {
    headers: { 'Content-Type': 'application/json' },
  });
});
```

**Acceptance Criteria:**

- Triggers fire on correct events
- Notifications created immediately
- Email/push queued correctly
- Shift reminders sent on schedule
- No duplicate notifications
- Logging helps debug issues
- Can disable triggers for testing

**Files to Create/Modify:**

- `supabase/migrations/[timestamp]_notification_triggers.sql` (new)
- `supabase/functions/schedule-shift-reminders/index.ts` (new)

---

### Task 11: Integration & Testing (5 hours)

**Priority:** Critical  
**Dependencies:** All above tasks

**Subtasks:**

1. Integration testing for notifications flow
2. Integration testing for messaging flow
3. Test notification preferences
4. Test real-time updates
5. Performance testing with many notifications
6. Mobile testing for all features
7. Accessibility audit
8. Cross-browser testing
9. Load testing messaging system
10. Documentation review

**Testing Checklist:**

```bash
# Unit Tests
npm test  # All 211+ tests must pass (186 + 25 new)

# Integration Tests
- Notification created → delivered in-app + email
- Message sent → received in real-time
- @mention → notification created
- Preference change → respected in delivery
- Shift assigned → notification + email
- Swap request → all parties notified

# Performance Tests
- 1000+ notifications load in <2s
- Real-time message <100ms latency
- Email delivered within 5 minutes
- Push delivered within 10 seconds

# Mobile Testing
- iOS Safari: Notifications, messaging
- Android Chrome: Notifications, messaging
- Tablet: Full functionality

# Accessibility
- Keyboard navigation works
- Screen reader compatible
- ARIA labels present
- Color contrast WCAG AA
```

**Acceptance Criteria:**

- All tests passing (211+)
- No console errors or warnings
- Real-time features work smoothly
- Mobile fully functional
- Email delivery confirmed
- Push notifications work
- Accessible to all users
- Performance meets targets

**Files to Create/Modify:**

- `src/components/Notifications/Notifications.test.tsx` (new)
- `src/components/Messaging/Messaging.test.tsx` (new)
- `src/services/notification.service.test.ts` (update)
- `src/services/messaging.service.test.ts` (update)

---

### Task 12: Documentation (3 hours)

**Priority:** Medium  
**Dependencies:** Task 11

**Subtasks:**

1. Write notifications user guide
2. Write messaging user guide
3. Write API documentation
4. Create troubleshooting guide
5. Add code examples
6. Update README
7. Create migration guide

**Documents to Create:**

1. **NOTIFICATIONS_GUIDE.md** - User guide
   - How notifications work
   - Configuring preferences
   - Email vs push vs in-app
   - Quiet hours
   - Troubleshooting

2. **MESSAGING_GUIDE.md** - User guide
   - Sending messages
   - Creating group chats
   - Using @mentions
   - Attaching files
   - Search tips

3. **API_NOTIFICATIONS.md** - Developer guide
   - API endpoints
   - Creating notifications programmatically
   - Webhooks for notifications
   - Code examples

**Acceptance Criteria:**

- All documentation complete
- Examples tested and working
- Screenshots included
- README updated
- Markdown properly formatted
- Links working

**Files to Create/Modify:**

- `docs/NOTIFICATIONS_GUIDE.md` (new)
- `docs/MESSAGING_GUIDE.md` (new)
- `docs/API_NOTIFICATIONS.md` (new)
- `docs/INDEX.md` (update)
- `README.md` (update)

---

## 📊 Time Estimates

| Task                          | Estimated Hours | Priority     |
| ----------------------------- | --------------- | ------------ |
| 1. Notifications Schema       | 3               | Critical     |
| 2. Notification Service       | 5               | Critical     |
| 3. In-App Notification Center | 6               | High         |
| 4. Email Notifications        | 5               | High         |
| 5. Push Notifications         | 4               | Medium       |
| 6. Messaging Schema           | 3               | High         |
| 7. Messaging Service          | 6               | High         |
| 8. Messaging UI               | 8               | High         |
| 9. Shift Notes                | 4               | Medium       |
| 10. Notification Triggers     | 4               | High         |
| 11. Integration & Testing     | 5               | Critical     |
| 12. Documentation             | 3               | Medium       |
| **TOTAL**                     | **56 hours**    | **~3 weeks** |

**Buffer:** Add 20% for unexpected issues = **67 hours total**

---

## 🎯 Success Metrics

### Performance Metrics

- [ ] In-app notifications delivered in <2s
- [ ] Email notifications sent within 5 minutes
- [ ] Messages delivered in <100ms
- [ ] 95%+ notification delivery success rate
- [ ] Bundle size increase <150KB

### Quality Metrics

- [ ] 211+ tests passing (add 25+ new tests)
- [ ] No TypeScript errors
- [ ] No console warnings
- [ ] Build succeeds
- [ ] Lint passes
- [ ] CodeQL passes

### User Experience Metrics

- [ ] Mobile responsive and fast
- [ ] Real-time updates feel instant
- [ ] Email templates look professional
- [ ] Messaging is intuitive
- [ ] Accessible to all users

### Adoption Metrics (post-launch)

- [ ] 90%+ users enable notifications
- [ ] 70%+ users adopt messaging
- [ ] 60%+ users use shift notes
- [ ] 80%+ email open rate for important notifications

---

## 🚨 Risks & Mitigations

### Risk 1: Email Delivery Issues

**Impact:** High  
**Probability:** Medium

**Mitigation:**

- Use reputable email service (SendGrid)
- Implement retry logic
- Monitor delivery rates
- Have fallback to in-app only
- Test with multiple email providers

### Risk 2: Real-time Scalability

**Impact:** High  
**Probability:** Medium

**Mitigation:**

- Use Supabase Realtime (proven at scale)
- Implement connection pooling
- Add rate limiting
- Monitor WebSocket connections
- Have fallback to polling

### Risk 3: Push Notification Complexity

**Impact:** Medium  
**Probability:** High

**Mitigation:**

- Start with PWA push (simpler)
- Make push optional (not required)
- Provide clear setup instructions
- Test on multiple browsers
- Have good error messages

### Risk 4: Notification Fatigue

**Impact:** Medium  
**Probability:** Medium

**Mitigation:**

- Smart defaults for preferences
- Implement quiet hours
- Allow granular control
- Batch similar notifications
- Respect user preferences strictly

---

## 🔧 Technical Decisions

### Email Service: SendGrid

**Rationale:**

- Reliable delivery (99%+ uptime)
- Generous free tier (100 emails/day)
- Easy Supabase integration
- Good templates support
- Detailed analytics

**Alternatives Considered:**

- AWS SES: More complex setup
- Mailgun: Similar features
- Resend: Newer, less proven

### Real-time: Supabase Realtime

**Rationale:**

- Already using Supabase
- Built-in authentication
- Automatic scaling
- PostgreSQL integration
- Proven reliable

### Push Notifications: Web Push API

**Rationale:**

- No external service needed
- Works in PWA
- Free
- Browser native
- Good mobile support

---

## 📝 Pre-Sprint Checklist

Before starting Sprint 6:

- [x] Sprint 1-5 completed and merged
- [x] All 186 tests passing
- [x] No blocking issues
- [ ] Email service account created (SendGrid)
- [ ] VAPID keys generated for push
- [ ] Team review of sprint plan
- [ ] Database backup before migrations

---

## 🎉 Sprint Completion Checklist

Sprint 6 is complete when:

### Features

- [ ] Notifications system fully functional
- [ ] Email notifications sending
- [ ] Push notifications working (PWA)
- [ ] In-app messaging working
- [ ] Shift notes implemented
- [ ] Real-time updates instant
- [ ] Notification preferences configurable
- [ ] All notification types implemented

### Quality

- [ ] 211+ tests passing
- [ ] No TypeScript errors
- [ ] No console warnings
- [ ] Build succeeds
- [ ] Lint passes
- [ ] CodeQL security scan passes

### Documentation

- [ ] NOTIFICATIONS_GUIDE.md complete
- [ ] MESSAGING_GUIDE.md complete
- [ ] API documentation updated
- [ ] README updated
- [ ] Code comments added

### Testing

- [ ] Manual testing on desktop
- [ ] Manual testing on mobile
- [ ] Email delivery confirmed
- [ ] Push notifications tested
- [ ] Real-time tested with multiple users
- [ ] Accessibility tested
- [ ] Cross-browser tested

### Deployment

- [ ] Database migrations applied
- [ ] Email service configured
- [ ] VAPID keys set in env
- [ ] Edge functions deployed
- [ ] Cron jobs configured
- [ ] Build deployed to staging
- [ ] Smoke tests pass on staging
- [ ] Ready for production

---

## 📚 Resources

### Email Services

- [SendGrid Documentation](https://docs.sendgrid.com/)
- [SendGrid Email Templates](https://mc.sendgrid.com/dynamic-templates)

### Push Notifications

- [Web Push API MDN](https://developer.mozilla.org/en-US/docs/Web/API/Push_API)
- [VAPID Keys Generation](https://vapidkeys.com/)
- [Service Worker Cookbook](https://serviceworke.rs/)

### Real-time

- [Supabase Realtime](https://supabase.com/docs/guides/realtime)
- [PostgreSQL LISTEN/NOTIFY](https://www.postgresql.org/docs/current/sql-notify.html)

### Testing

- [Testing Library](https://testing-library.com/)
- [Vitest](https://vitest.dev/)
- [Supabase Testing Guide](https://supabase.com/docs/guides/local-development)

---

**Document Version:** 1.0  
**Created:** December 7, 2024  
**Sprint:** 6 - Communication & Notifications  
**Estimated Completion:** Week 10 (late January 2025)
