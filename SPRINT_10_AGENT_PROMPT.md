# Sprint 10 Agent Prompt: Advanced Features & Platform

## 🎯 Mission Brief

Implement **Mobile App**, **Multi-Location Support**, and **Advanced Permissions** to expand ScaleFlow's platform capabilities.

**Sprint Goals:**

1. ✅ React Native mobile app foundation
2. ✅ Multi-location management
3. ✅ Custom roles and permissions
4. ✅ Platform scalability

**Timeline:** 46-55 hours (~3 weeks)

---

## 🎯 Success Criteria

### Features ✅
- [ ] Mobile app (iOS/Android) functional
- [ ] Multi-location support
- [ ] Custom role creation
- [ ] Granular permissions

### Quality ✅
- [ ] 211+ tests passing
- [ ] Mobile app tested on devices
- [ ] Permissions enforced correctly

---

## 📦 Task List

### Phase 1: Mobile Foundation (Day 1-5)

#### Task 1: React Native Setup (8h)
Create Expo project, set up navigation, authentication.

#### Task 6: Mobile Core Features (10h)
Build Login, Dashboard, Shifts, TimeClock screens.

---

### Phase 2: Multi-Location (Day 6-9)

#### Task 2: Location Schema (4h)
Create locations table, update shifts and profiles.

#### Task 3: Location UI (6h)
Location management interface, location selector.

---

### Phase 3: Permissions (Day 10-13)

#### Task 4: Permissions Schema (4h)
Create custom_roles table with JSONB permissions.

#### Task 5: Permissions UI (5h)
Role management and permission editor.

---

### Phase 4: Final Polish (Day 14-15)

#### Task 7: AI Planning (2h)
Document AI roadmap for future sprints.

#### Task 8: Testing (4h)
Test all features, mobile app on devices.

#### Task 9: Documentation (3h)
Create user guides for new features.

---

## 🔧 Technical Guidelines

### Mobile App
- Use Expo for faster development
- Implement proper navigation
- Handle push notifications
- Test on real devices

### Multi-Location
- Location-based filtering throughout
- Timezone handling per location
- Location permissions

### Permissions
- JSONB for flexibility
- Check permissions server-side
- Cache permission checks

---

## 🚨 Common Pitfalls

### ❌ Don't
- Skip real device testing
- Forget timezone conversions
- Trust client-side permission checks
- Hardcode location IDs

### ✅ Do
- Test on iOS and Android
- Convert timezones properly
- Enforce permissions server-side
- Use location selectors

---

## 🎯 Final Checklist

- [ ] Mobile app working
- [ ] Multi-location functional
- [ ] Permissions enforced
- [ ] 211+ tests passing
- [ ] Documentation complete

---

**First Task:** React Native Setup

**Remember:** This is foundation for future mobile features!

---

**Document Version:** 1.0  
**Created:** December 7, 2024  
**Sprint:** 10 - Platform Expansion
