# Frontend Critical Paths

**Project:** roomet  
**Tech Stack:** React + TypeScript + Vite + Convex + Tailwind CSS + shadcn/ui  
**Last Updated:** 2025-03-28

---

## 1. Authentication & Onboarding Path

**File:** `src/App.tsx:34-88`

**Flow:**
```
Login → Session Check → Profile Sync → Onboarding → Role-Based Redirect
```

**Critical Components:**
- `AuthGuard` - Main authentication wrapper
- `PublicOnly` - Prevents logged-in users from accessing auth pages
- `OnboardingPage` - Role selection and profile completion

**Validation Chain:**
1. Wait for better-auth session to load
2. Check if user is logged in
3. Wait for Convex profile data
4. Verify onboarding completion
5. Role mismatch check (if route requires specific role)

**Failure Points:**
- Session loading timeout
- Profile sync failure (`api.users.syncProfile`)
- Incomplete onboarding blocking all access
- Role misroute redirects

---

## 2. Tenant User Journey

**Entry Point:** `/tenant` (requires `viewer` role)
**File:** `src/App.tsx:163-176`

| Route | Component | Purpose | Data Dependencies |
|-------|-----------|---------|-------------------|
| `/tenant` | `TenantDashboard` | Main dashboard | `api.dashboard.getTenantDashboard` |
| `/tenant/map` | `MapExplorer` (22KB) | Property discovery via map | `api.properties.getAll`, `api.bookmarks.getBookmarksForUser` |
| `/tenant/map/roomet/:id` | `BoardingHouseDetails` (27KB) | Property details view | `api.properties.getById`, `api.reviews.getByPropertyId` |
| `/tenant/bookmarks` | `Bookmarks` | Saved properties | `api.bookmarks.getBookmarksForUser` |
| `/tenant/inquiries` | `TenantInquiries` (21KB) | Message conversations | `api.inquiries.getConversationsForViewer` |
| `/tenant/profile` | `ProfileSettings` (17KB) | Account settings | `api.users.getMyProfile` |

**Critical Data Dependencies:**
- `api.users.getMyProfile` → role verification
- `api.properties.getAll` / `api.properties.getById` → property listings
- `api.bookmarks.getBookmarksForUser` → saved items
- `api.conversations.getForViewer` → inquiry messaging

---

## 3. Owner Management Path

**Entry Point:** `/owner` (requires `owner` role)
**File:** `src/App.tsx:148-160`

| Route | Component | Size | Purpose | Criticality |
|-------|-----------|------|---------|-------------|
| `/owner` | `OwnerDashboard` | 10KB | Dashboard overview | Entry point |
| `/owner/properties` | `MyProperties` | 27KB | Property listing management | Core business |
| `/owner/properties/add` | `AddProperty` | **58KB** | Create new property | **Highest risk** |
| `/owner/properties/edit/:id` | `EditProperty` | **52KB** | Modify existing property | **High risk** |
| `/owner/inquiries` | `OwnerInquiries` | 21KB | Lead/conversation management | Revenue critical |
| `/owner/reviews` | `OwnerReviews` | 16KB | Review and reputation management | Trust critical |
| `/owner/settings` | `OwnerSettings` | 17KB | Account configuration | Operational |

**Complex Components Analysis:**
- **AddProperty (58KB)** - Multi-step form with room nested arrays, image uploads, location picker
- **EditProperty (52KB)** - Similar complexity with existing data hydration
- Both handle: `properties` table + nested `rooms` array + image storage

---

## 4. Data Model Critical Paths

**File:** `convex/schema.ts`

### Entity Relationship Diagram

```
users (authUserId, role, onboardingComplete)
  │
  ├── viewer role ──┬──→ bookmarks ──→ properties
  │                 └──→ conversations ──→ messages
  │
  └── owner role ───→ properties ──┬──→ rooms (nested)
                                   ├──→ reviews
                                   └──→ conversations ──→ messages
```

### Key Tables & Indexes

| Table | Critical Indexes | Purpose |
|-------|-----------------|---------|
| `users` | `by_authUserId` | Profile lookup from auth |
| `properties` | `by_ownerId`, `by_status` | Owner properties, filtering |
| `bookmarks` | `by_user_property` (unique) | Prevent duplicates, quick lookup |
| `conversations` | `by_viewer_property` | Single conversation per viewer/property |
| `messages` | `by_conversation` | Message threading |
| `reviews` | `by_propertyId` | Property ratings |

### Soft Delete Pattern (Conversations)
- `viewerDeleted` / `ownerDeleted` flags
- `viewerMessagesCutoff` / `ownerMessagesCutoff` timestamps
- Allows per-user conversation visibility control

---

## 5. Application Bootstrap Chain

**File:** `src/main.tsx:44-51`

```
ErrorBoundary
  └── ConvexBetterAuthProvider (convex + authClient)
        └── App (ThemeProvider + BrowserRouter)
              └── Routes
```

### Critical Dependencies

| Dependency | Source | Failure Impact |
|------------|--------|----------------|
| `VITE_CONVEX_URL` | Environment | Complete app failure |
| `@convex-dev/better-auth` | NPM | Authentication broken |
| `convex/react` | NPM | No data access |
| `react-router-dom` | NPM | Navigation broken |

### Error Handling
- **ErrorBoundary** - Catches React render errors, displays fallback UI
- **AuthGuard loading states** - Three-stage spinner (session → profile → authorized)

---

## 6. API Integration Points

### Convex Query/Mutation Patterns

**Authentication:**
- `api.users.getMyProfile` - Current user data
- `api.users.syncProfile` - Update profile from auth provider

**Properties:**
- `api.properties.getAll` - List all (for map)
- `api.properties.getById` - Single property details
- `api.properties.getByOwner` - Owner's properties
- `api.properties.create` / `api.properties.update` / `api.properties.remove`

**Bookmarks:**
- `api.bookmarks.getBookmarksForUser`
- `api.bookmarks.addBookmark` / `api.bookmarks.removeBookmark`

**Inquiries (Conversations):**
- `api.inquiries.getConversationsForViewer` / `api.inquiries.getConversationsForOwner`
- `api.inquiries.getMessages` / `api.inquiries.sendMessage`

---

## Risk Assessment Summary

| Rank | Path | Risk Factor | Mitigation Priority |
|------|------|-------------|---------------------|
| 1 | **Add/Edit Property** | Largest components (58KB, 52KB), complex nested room arrays, image uploads | **Critical** |
| 2 | **AuthGuard** | Multi-stage loading, redirect chains, race conditions | **Critical** |
| 3 | **Map → Property Details** | Map integration complexity, dynamic routing, URL params | High |
| 4 | **Inquiry System** | Cross-user messaging, soft-delete logic, real-time updates | High |
| 5 | **Onboarding** | Gates all downstream access, role selection irreversibility | Medium |
| 6 | **Image Uploads** | Storage integration, file validation, upload failures | Medium |

---

## Monitoring Points

Add logging/metrics at these critical junctions:

1. **AuthGuard redirect reasons** - Track why users are redirected
2. **Property form submissions** - Track validation failures, submit success rate
3. **Map interactions** - Track property selection funnel
4. **Conversation creation** - Track inquiry initiation rates
5. **Onboarding completion** - Track drop-off points in flow
