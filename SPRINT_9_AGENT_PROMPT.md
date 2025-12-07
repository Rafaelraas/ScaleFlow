# Sprint 9 Agent Prompt: Integrations & Automation

## 🎯 Mission Brief

Implement **Webhooks**, **Calendar Sync**, and **Email Templates** to enable ScaleFlow to integrate with external systems.

**Sprint Goals:**

1. ✅ Webhook system with retry logic
2. ✅ Google/Outlook calendar integration
3. ✅ iCal feed generation
4. ✅ Custom email templates

**Timeline:** 38-46 hours (~2 weeks)

---

## 🎯 Success Criteria

### Features ✅
- [ ] Webhooks with HMAC signatures
- [ ] Webhook management UI
- [ ] Google Calendar sync
- [ ] Outlook Calendar sync
- [ ] iCal feed generation
- [ ] Email template editor

### Quality ✅
- [ ] 211+ tests passing
- [ ] >99% webhook delivery
- [ ] Calendar sync working
- [ ] API docs complete

---

## 📦 Task List

### Phase 1: Webhooks (Day 1-5)

#### Task 1: Webhook Schema (3h)
Create webhooks and webhook_deliveries tables. See SPRINT_9_PLAN.md Task 1.

#### Task 2: Webhook Service (6h)
Implement WebhookService with HMAC signing. Create process-webhooks edge function.

#### Task 3: Webhook UI (5h)
Build webhook management interface with delivery logs.

---

### Phase 2: Calendar Sync (Day 6-9)

#### Task 4: Google Calendar (5h)
OAuth flow, sync shifts to Google Calendar.

#### Task 5: Outlook Calendar (4h)
OAuth flow, sync shifts to Outlook.

#### Task 6: iCal Feed (3h)
Generate iCal feeds with secure tokens.

---

### Phase 3: Templates & Docs (Day 10-11)

#### Task 7: Email Templates (4h)
Template editor with preview and variables.

#### Task 8: API Docs (4h)
OpenAPI/Swagger documentation.

#### Task 9: Testing (4h)
Test all integrations thoroughly.

---

## 🔧 Technical Guidelines

### Webhook Security
- Always use HMAC signatures
- Validate URLs before saving
- Implement retry with exponential backoff
- Log all deliveries

### Calendar Integration
- Store tokens securely
- Handle token refresh
- Respect rate limits
- Error handling for failed syncs

---

## 🚨 Common Pitfalls

### ❌ Don't
- Skip HMAC signatures
- Store tokens unencrypted
- Retry infinitely
- Expose webhook secrets in UI

### ✅ Do
- Sign all webhook payloads
- Encrypt tokens at rest
- Limit retry attempts (3 max)
- Show only last 4 chars of secrets

---

## 🎯 Final Checklist

- [ ] Webhooks functional
- [ ] Calendar sync working
- [ ] iCal feeds valid
- [ ] Email templates editable
- [ ] API docs complete
- [ ] 211+ tests passing

---

**First Task:** Webhook Schema - Create tables and policies

**Remember:** Security first - always sign webhooks!

---

**Document Version:** 1.0  
**Created:** December 7, 2024  
**Sprint:** 9 - Integrations
