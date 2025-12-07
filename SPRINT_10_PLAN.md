# Sprint 10: Advanced Features & Platform

**Sprint Duration:** Week 17+ (ongoing)  
**Status:** 📋 Planned  
**Priority:** Medium 🟡  
**Main Goals:**

1. Mobile App (React Native) - Foundation
2. Multi-location Support
3. Advanced Permissions & Roles
4. AI-Powered Features (Future)

---

## 📋 Executive Summary

Sprint 10 focuses on platform expansion and advanced enterprise features. This sprint lays the foundation for mobile apps, multi-location management, and future AI capabilities.

**Expected Impact:**

- Native mobile app experience
- Support for franchise/multi-location businesses
- Flexible permission system
- Foundation for AI features

---

## 🎯 Sprint Objectives

### Primary Goals

1. **Mobile App Foundation** (P1 - Critical)
   - React Native project setup
   - Basic authentication
   - Shift viewing
   - Clock in/out
   - Push notifications

2. **Multi-Location Support** (P2 - High)
   - Multiple locations per company
   - Location-specific schedules
   - Cross-location employee assignment
   - Location-based permissions

3. **Advanced Permissions** (P3 - Medium)
   - Custom role creation
   - Granular permissions
   - Department-based access

---

## 📦 Task Breakdown

### Task 1: React Native Setup (8 hours)

**Project Setup:**

```bash
# Create React Native project with Expo
npx create-expo-app ScaleFlowMobile
cd ScaleFlowMobile

# Install dependencies
npm install @react-navigation/native @react-navigation/stack
npm install @supabase/supabase-js
npm install react-native-safe-area-context react-native-screens
npm install expo-secure-store expo-notifications
```

**Project Structure:**

```
mobile/
├── src/
│   ├── screens/
│   │   ├── Login.tsx
│   │   ├── Dashboard.tsx
│   │   ├── Shifts.tsx
│   │   └── TimeClock.tsx
│   ├── components/
│   ├── services/
│   ├── hooks/
│   └── types/
├── app.json
└── package.json
```

**Files to Create:**
- Mobile app project structure
- Basic navigation
- Authentication screens

---

### Task 2: Multi-Location Schema (4 hours)

**Database Design:**

```sql
CREATE TABLE locations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  company_id UUID REFERENCES companies(id) NOT NULL,
  name TEXT NOT NULL,
  address TEXT,
  city TEXT,
  state TEXT,
  zip TEXT,
  country TEXT,
  timezone TEXT NOT NULL DEFAULT 'America/New_York',
  phone TEXT,
  active BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_locations_company ON locations(company_id);

-- Update shifts table
ALTER TABLE shifts ADD COLUMN location_id UUID REFERENCES locations(id);
CREATE INDEX idx_shifts_location ON shifts(location_id);

-- Update profiles table
ALTER TABLE profiles ADD COLUMN primary_location_id UUID REFERENCES locations(id);
CREATE INDEX idx_profiles_location ON profiles(primary_location_id);

-- Employee location assignments (for multi-location employees)
CREATE TABLE employee_locations (
  employee_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  location_id UUID REFERENCES locations(id) ON DELETE CASCADE,
  can_manage BOOLEAN DEFAULT false,
  created_at TIMESTAMP DEFAULT NOW(),
  PRIMARY KEY (employee_id, location_id)
);

-- RLS Policies
ALTER TABLE locations ENABLE ROW LEVEL SECURITY;

CREATE POLICY locations_company_access 
  ON locations 
  USING (
    company_id IN (
      SELECT company_id FROM profiles WHERE id = auth.uid()
    )
  );
```

**Files to Create:**
- `supabase/migrations/[timestamp]_create_locations.sql`
- `src/types/locations.ts`

---

### Task 3: Location Management UI (6 hours)

**UI Components:**

```typescript
// src/pages/Locations.tsx
export const LocationsPage = () => {
  const [locations, setLocations] = useState<Location[]>([]);

  return (
    <Layout>
      <div className="space-y-6">
        <div className="flex justify-between">
          <h1>Locations</h1>
          <Button onClick={() => setShowCreateModal(true)}>
            Add Location
          </Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {locations.map(location => (
            <LocationCard
              key={location.id}
              location={location}
              onEdit={handleEdit}
              onDelete={handleDelete}
            />
          ))}
        </div>
      </div>
    </Layout>
  );
};

// Location selector for schedules
export const LocationSelector = ({ selected, onChange }) => {
  const { data: locations } = useLocations();

  return (
    <Select value={selected} onValueChange={onChange}>
      <SelectTrigger>
        <SelectValue placeholder="Select location" />
      </SelectTrigger>
      <SelectContent>
        {locations?.map(loc => (
          <SelectItem key={loc.id} value={loc.id}>
            {loc.name}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
};
```

**Features:**
- Create/edit/delete locations
- View location details
- Location selector in schedule creation
- Location-based filtering
- Employee location assignments

**Files to Create:**
- `src/pages/Locations.tsx`
- `src/components/Locations/LocationCard.tsx`
- `src/components/Locations/LocationSelector.tsx`
- `src/services/location.service.ts`

---

### Task 4: Advanced Permissions Schema (4 hours)

**Database Design:**

```sql
-- Custom roles
CREATE TABLE custom_roles (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  company_id UUID REFERENCES companies(id) NOT NULL,
  name TEXT NOT NULL,
  description TEXT,
  permissions JSONB NOT NULL,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Permission structure in JSONB:
-- {
--   "shifts": {
--     "view_all": true,
--     "create": true,
--     "edit_all": true,
--     "delete_all": false
--   },
--   "employees": {
--     "view": true,
--     "invite": true,
--     "edit": false,
--     "delete": false
--   },
--   "schedules": {
--     "view": true,
--     "publish": false,
--     "export": true
--   },
--   "analytics": {
--     "view": false
--   },
--   "settings": {
--     "company": false,
--     "integrations": false,
--     "billing": false
--   }
-- }

-- Update profiles to use custom roles
ALTER TABLE profiles ADD COLUMN custom_role_id UUID REFERENCES custom_roles(id);
```

**Files to Create:**
- `supabase/migrations/[timestamp]_create_custom_roles.sql`
- `src/types/permissions.ts`

---

### Task 5: Permission Management UI (5 hours)

**UI Components:**

```typescript
// src/pages/RolesPermissions.tsx
export const RolesPermissionsPage = () => {
  const [roles, setRoles] = useState<CustomRole[]>([]);

  return (
    <Layout>
      <div className="space-y-6">
        <h1>Roles & Permissions</h1>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <RoleList
            roles={roles}
            onSelect={setSelectedRole}
            onCreate={handleCreateRole}
          />

          {selectedRole && (
            <PermissionEditor
              role={selectedRole}
              onSave={handleSavePermissions}
            />
          )}
        </div>
      </div>
    </Layout>
  );
};

// src/components/Permissions/PermissionEditor.tsx
export const PermissionEditor = ({ role, onSave }) => {
  const [permissions, setPermissions] = useState(role.permissions);

  return (
    <Card className="col-span-2">
      <CardHeader>
        <CardTitle>Edit Permissions: {role.name}</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <PermissionSection
          title="Shifts"
          permissions={permissions.shifts}
          onChange={(shifts) => setPermissions({ ...permissions, shifts })}
        />
        
        <PermissionSection
          title="Employees"
          permissions={permissions.employees}
          onChange={(employees) => setPermissions({ ...permissions, employees })}
        />

        {/* More sections... */}

        <Button onClick={() => onSave(permissions)}>
          Save Permissions
        </Button>
      </CardContent>
    </Card>
  );
};
```

**Files to Create:**
- `src/pages/RolesPermissions.tsx`
- `src/components/Permissions/PermissionEditor.tsx`
- `src/hooks/usePermissions.ts`
- `src/services/permissions.service.ts`

---

### Task 6: Mobile App Core Features (10 hours)

**Core Screens:**

1. **Login Screen**
2. **Dashboard** - Today's shifts
3. **Shifts List** - Upcoming shifts
4. **Time Clock** - Clock in/out
5. **Notifications** - Push notifications

**React Native Implementation:**

```typescript
// mobile/src/screens/TimeClock.tsx
export const TimeClockScreen = () => {
  const [currentEntry, setCurrentEntry] = useState<TimeEntry | null>(null);

  const handleClockIn = async () => {
    // Get location
    const location = await Location.getCurrentPositionAsync();
    
    // Clock in
    await TimeTrackingService.clockIn({
      employeeId: user.id,
      location: {
        lat: location.coords.latitude,
        lng: location.coords.longitude,
      },
    });
  };

  return (
    <View style={styles.container}>
      <Text style={styles.time}>{currentTime}</Text>
      <Text style={styles.date}>{currentDate}</Text>

      {currentEntry ? (
        <Button title="Clock Out" onPress={handleClockOut} />
      ) : (
        <Button title="Clock In" onPress={handleClockIn} />
      )}
    </View>
  );
};
```

**Files to Create:**
- Mobile app screens
- Navigation setup
- Push notification handling

---

### Task 7: AI Features Planning (2 hours)

**Future AI Capabilities:**

1. **Schedule Optimization**
   - AI-powered schedule generation
   - Minimize labor costs
   - Maximize coverage
   - Respect preferences

2. **Demand Forecasting**
   - Predict busy periods
   - Suggest optimal staffing
   - Historical analysis

3. **Intelligent Recommendations**
   - Shift swap suggestions
   - Employee availability predictions
   - Conflict resolution

**Files to Create:**
- `docs/AI_FEATURES_ROADMAP.md`
- Planning documents only (no implementation in this sprint)

---

### Task 8: Integration & Testing (4 hours)

**Testing:**
- Multi-location features work
- Permissions enforced correctly
- Mobile app authenticates
- Cross-platform functionality

**Files to Create:**
- `src/services/location.service.test.ts`
- `src/services/permissions.service.test.ts`

---

### Task 9: Documentation (3 hours)

**Documents to Create:**

1. **MULTI_LOCATION_GUIDE.md** - Managing multiple locations
2. **PERMISSIONS_GUIDE.md** - Custom roles and permissions
3. **MOBILE_APP_GUIDE.md** - Mobile app features
4. **AI_ROADMAP.md** - Future AI capabilities

**Files to Create:**
- `docs/MULTI_LOCATION_GUIDE.md`
- `docs/PERMISSIONS_GUIDE.md`
- `docs/MOBILE_APP_GUIDE.md`

---

## 📊 Time Estimates

| Task | Hours | Priority |
|------|-------|----------|
| 1. React Native Setup | 8 | Critical |
| 2. Multi-Location Schema | 4 | High |
| 3. Location UI | 6 | High |
| 4. Permissions Schema | 4 | Medium |
| 5. Permissions UI | 5 | Medium |
| 6. Mobile Core Features | 10 | Critical |
| 7. AI Planning | 2 | Low |
| 8. Testing | 4 | Critical |
| 9. Documentation | 3 | Medium |
| **TOTAL** | **46 hours** | **~3 weeks** |

**Buffer:** +20% = **55 hours total**

---

## 🎯 Success Metrics

- [ ] Mobile app functional (iOS/Android)
- [ ] Multi-location support complete
- [ ] Custom permissions working
- [ ] 211+ tests passing
- [ ] Mobile app published to stores (future)

---

## 🔮 Future Sprints (Beyond Sprint 10)

- Mobile App Polish & App Store Release
- AI Schedule Optimization
- Advanced Analytics (ML-powered)
- Employee Self-Service Portal
- Payroll Integration
- Advanced Compliance Features
- White-Label Solutions

---

**Document Version:** 1.0  
**Created:** December 7, 2024  
**Sprint:** 10 - Advanced Features & Platform
