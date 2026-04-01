# 🏠 Roomet

> A boarding house discovery and management platform for tenants and property owners.

[![Deployed on Vercel](https://img.shields.io/badge/Live-roomet.vercel.app-000000?logo=vercel&logoColor=white)](https://roomet.vercel.app)

---

## What is Roomet?

Roomet connects people looking for boarding house rooms with property owners who list them. Instead of browsing scattered Facebook groups or walking door-to-door, tenants can explore available rooms on an interactive map, compare prices and amenities, and message owners directly — all in one place.

Owners get a dedicated dashboard to manage their listings, respond to inquiries, and track how their properties are performing.

---

## Who is it for?

### 🔍 Tenants (Viewers)

- **Explore** boarding houses on an interactive map
- **Filter** by price, amenities, gender restrictions, and room type
- **View** detailed property pages with photos, room breakdowns, rules, and visiting schedules
- **Bookmark** properties to revisit later
- **Inquire** — start a real-time conversation with any property owner
- **Review** — rate and leave feedback on places you've visited
- **Dashboard** — see your recent activity, active inquiries, and bookmarked places at a glance

### 🏢 Owners

- **List properties** with photos, room configurations, pricing (per-person or per-room), amenities, and house rules
- **Manage listings** — edit, toggle visibility, soft-delete, and restore properties
- **Respond to inquiries** — real-time messaging with tenants, including image sharing
- **Monitor performance** — dashboard with stats on views, inquiries, occupancy, and reviews
- **Manage reviews** — read tenant feedback and post replies
- **Account settings** — profile management, password changes, linked accounts

---

## How it works

1. **Sign up** with email/password or Google — email verification is required
2. **Choose your role** during onboarding: tenant or owner
3. **Tenants** land on their dashboard and can immediately explore the map
4. **Owners** land on their dashboard and can start adding properties

All data syncs in real-time — when an owner updates a listing or responds to a message, tenants see it instantly without refreshing.

---

## Key Features

| Feature | Description |
| :--- | :--- |
| **Interactive Map** | MapLibre GL-powered map with property markers, click-to-view details, and a filterable sidebar |
| **Real-time Messaging** | Conversation threads between tenants and owners with text + image support and read receipts |
| **Property Management** | Full CRUD with multi-image upload, room-level pricing, amenity tagging, and soft-delete/restore |
| **Reviews & Ratings** | 5-star rating system with comments, owner replies, and report functionality |
| **Bookmarks** | Save properties and access them from a dedicated bookmarks page |
| **Role-based Access** | Separate dashboards and navigation for tenants vs. owners, enforced at the routing level |
| **Dark Mode** | System-aware light/dark theme toggle |
| **Auth Flow** | Email/password + Google OAuth, email verification, password reset, onboarding wizard |
| **Mobile Responsive** | Optimized layouts for both desktop and mobile viewports |

---

## Built With

| | Technology |
| :--- | :--- |
| **Frontend** | React 19, TypeScript, Vite, Tailwind CSS, Framer Motion |
| **Backend** | Convex (serverless real-time database + functions) |
| **Auth** | Better Auth with Google OAuth + email verification via EmailJS |
| **Maps** | MapLibre GL JS with OpenStreetMap / CartoDB tiles |
| **UI Components** | shadcn/ui (Radix primitives) + Lucide icons |
| **Hosting** | Vercel (frontend) + Convex Cloud (backend) |
