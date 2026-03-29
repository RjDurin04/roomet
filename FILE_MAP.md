# Frontend File Map

**Location:** `c:\Projects\roomet\frontend`

---

## Root Files

| File | Purpose |
|------|---------|
| `.env.local` | Environment variables |
| `.gitignore` | Git ignore rules |
| `.npmrc` | NPM configuration |
| `.nvmrc` | Node version specification |
| `README.md` | Project documentation |
| `components.json` | shadcn/ui configuration |
| `eslint.config.js` | ESLint configuration |
| `index.html` | HTML entry point |
| `lefthook.yml` | Git hooks configuration |
| `package-lock.json` | Locked dependencies |
| `package.json` | Project manifest |
| `postcss.config.js` | PostCSS configuration |
| `skills-lock.json` | Skills lock file |
| `tailwind.config.js` | Tailwind CSS configuration |
| `tsconfig.app.json` | TypeScript app config |
| `tsconfig.json` | TypeScript root config |
| `tsconfig.node.json` | TypeScript node config |
| `vite.config.ts` | Vite configuration |

---

## Directory Structure

### `convex/` - Backend Functions

```
convex/
├── _generated/           # Generated client code
├── auth.config.ts        # Auth provider config
├── auth.ts               # Authentication functions
├── bookmarks.ts          # Bookmark CRUD operations
├── convex.config.ts      # Convex configuration
├── dashboard.ts          # Dashboard data queries
├── http.ts               # HTTP actions
├── inquiries.ts          # Inquiry management
├── notifications.ts      # Notification system
├── properties.ts         # Property CRUD operations
├── reviews.ts            # Review system
├── schema.ts             # Database schema
├── test.ts               # Test functions
└── users.ts              # User management
```

---

### `public/` - Static Assets

```
public/
├── favicon.svg
└── icons.svg
```

---

### `src/` - Source Code

#### `src/assets/`

| File | Description |
|------|-------------|
| `hero.png` | Hero image asset |
| `react.svg` | React logo |
| `vite.svg` | Vite logo |

---

#### `src/components/`

**`components/layout/` - Layout Components**

| File | Purpose |
|------|---------|
| `MainLayout.tsx` | Main application layout |
| `OwnerLayout.tsx` | Owner dashboard layout |

**`components/ui/` - UI Components (shadcn/ui)**

| File | Component |
|------|-----------|
| `badge.tsx` | Badge |
| `button.tsx` | Button |
| `card.tsx` | Card |
| `input.tsx` | Input |
| `map.tsx` | Map (41KB) |
| `popover.tsx` | Popover |
| `scroll-area.tsx` | Scroll Area |
| `separator.tsx` | Separator |

---

#### `src/contexts/`

| File | Purpose |
|------|---------|
| `ThemeContext.tsx` | Theme/light-dark mode context |

---

#### `src/lib/`

| File | Purpose |
|------|---------|
| `auth-client.ts` | Auth client utilities |
| `utils.ts` | General utilities |

---

#### `src/services/`

| File | Purpose |
|------|---------|
| `mockData.ts` | Mock data (10KB) |
| `mockOwnerData.ts` | Owner mock data (4KB) |

---

#### `src/features/` - Feature-Based Organization

**`features/auth/` - Authentication**

| File | Page |
|------|------|
| `EmailVerificationPage.tsx` | Email verification |
| `ForgotPasswordPage.tsx` | Forgot password |
| `LoginPage.tsx` | Login |
| `OnboardingPage.tsx` | User onboarding |
| `ResetPasswordPage.tsx` | Password reset |

**`features/boarding-house/` - Property Details**

| File | Purpose |
|------|---------|
| `BoardingHouseDetails.tsx` | Property details page (27KB) |
| `index.ts` | Barrel export |

**`features/bookmarks/` - Saved Properties**

| File | Purpose |
|------|---------|
| `Bookmarks.tsx` | User bookmarks page |

**`features/dashboard/` - User Dashboard**

| File | Purpose |
|------|---------|
| `Dashboard.tsx` | Main dashboard (18KB) |

**`features/inquiries/` - User Inquiries**

| File | Purpose |
|------|---------|
| `Inquiries.tsx` | User inquiries (21KB) |

**`features/map/` - Map Exploration**

| File | Purpose |
|------|---------|
| `MapExplorer.tsx` | Map-based search (22KB) |
| `index.ts` | Barrel export |

**`features/owner/` - Owner Dashboard Features**

```
features/owner/
├── inquiries/
│   └── OwnerInquiries.tsx      # Owner inquiry management (21KB)
├── owner-dashboard/
│   ├── OwnerDashboard.tsx      # Owner dashboard (10KB)
│   └── OwnerSettings.tsx       # Owner settings (17KB)
├── properties/
│   ├── AddProperty.tsx         # Add new property (58KB)
│   ├── EditProperty.tsx        # Edit property (52KB)
│   └── MyProperties.tsx        # Property list (27KB)
└── reviews/
    └── OwnerReviews.tsx        # Owner reviews (16KB)
```

**`features/profile/` - User Profile**

| File | Purpose |
|------|---------|
| `ProfileSettings.tsx` | Profile settings (17KB) |

**`features/reviews/` - Reviews**

*Empty directory*

**`features/search/` - Property Search**

| File | Purpose |
|------|---------|
| `SearchFilter.tsx` | Search filters (6KB) |
| `SearchPage.tsx` | Search results page (6KB) |
| `index.ts` | Barrel export |

---

## Root Source Files

| File | Purpose |
|------|---------|
| `App.css` | App styles |
| `App.tsx` | Main app component (8KB) |
| `index.css` | Global styles |
| `main.tsx` | Application entry point |

---

## Summary Statistics

| Metric | Count |
|--------|-------|
| Total Files | 75 |
| TypeScript/TSX Files | ~35 |
| Convex Backend Files | 13 |
| Feature Modules | 10 |
| UI Components | 8 |
| Layout Components | 2 |

**Tech Stack:** React + TypeScript + Vite + Convex + Tailwind CSS + shadcn/ui
