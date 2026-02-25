# SoundTribe — Architecture Decision Document

> **Living document.** Last updated: 2025-07-23.
> Read [docs/PRODUCT_VISION.md](docs/PRODUCT_VISION.md) first for product context.
> All architectural decisions exist to serve the product vision — when they conflict, the product vision wins.

---

## Grounding Reality: What the Codebase Actually Is

Before any decisions, it's critical to document the **real** current state — not what was intended, but what exists.

### What `web/` actually is today

`web/` is a **fully self-contained Next.js 15 (App Router) application** with zero dependency on the Express server for data operations.

**Completed (Phases 0–3):**
- ✅ Prisma 6 + PostgreSQL (Neon) as the database layer
- ✅ NextAuth v5 with Credentials provider, JWT strategy, httpOnly cookie sessions
- ✅ Middleware-level route protection (auth.config.ts + middleware.ts)
- ✅ Server Actions for ALL domains (auth, events, artists, applications, users, genres, notifications, networking)
- ✅ Zod-validated environment variables (lib/env.ts)
- ✅ TypeScript types for all domain models (types/) — zero transitional types remain
- ✅ All TanStack Query hooks removed and replaced with Server Actions
- ✅ All Axios/fetch calls to Express removed
- ✅ axios, @tanstack/react-query, socket.io-client uninstalled

**Still pending:**
- ❌ Real-time messaging (chat) — placeholder page, waiting for Ably integration (Phase 4)
- ❌ Real-time notification push — using 30s polling as interim solution

`web/` currently uses:
- ✅ Next.js 15 with Turbopack
- ✅ **NextAuth v5** (httpOnly cookie sessions, JWT strategy, Prisma adapter)
- ✅ **Prisma 6** → PostgreSQL (Neon serverless)
- ✅ **Server Actions** for all data mutations and fetching
- ✅ **shadcn/ui** + **Radix UI** + **Tailwind CSS v4** for UI
- ✅ **React Hook Form** + **Zod** for forms
- ✅ **Framer Motion** for animations
- ✅ **Storybook** for component development

### What `server/` actually is

A fully working **Express.js + TypeScript + MongoDB (Mongoose)** API hosted on **Render**. It handles:
- JWT-based auth (bcrypt + jsonwebtoken)
- All CRUD operations (events, artist profiles, applications, users, genres)
- Real-time messaging via **Socket.IO**
- File uploads via **Cloudinary + Multer**
- Rate limiting via `express-rate-limit`

### What `client/` is

The original **React 18 + Vite + TanStack Query** frontend. The `web/` directory is a port of this to Next.js. `client/` is fully superseded — it only exists for reference.

### The Actual Architecture (as-is, post Phase 3)

```
Browser
  └── web/ (Next.js 15 — fully self-contained)
        ├── NextAuth v5 (httpOnly cookie JWT sessions)
        ├── Prisma 6 → PostgreSQL (Neon) — ALL domains
        ├── Server Actions (auth, events, artists, applications, users, genres, notifications, networking)
        ├── Middleware (route protection via auth.config.ts)
        ├── Cloudinary (image uploads via presigned URLs)
        └── Polling (30s interval for notification unread count — interim until Ably)
```

The Express server (`server/`) is no longer required for any data operations. It remains in the repo for reference only.

---

## A. Final Tech Stack: Confirmed Decisions

### Principle: Migrate Completely

The target is a **fully self-contained Next.js 15 application** with zero dependency on the Express server. The Express server (`server/`) and legacy Vite client (`client/`) will be fully decommissioned by the end of this migration.

```
Target Architecture
───────────────────
Browser
  └── Next.js 15 (App Router)
        ├── Server Components (data fetching)
        ├── Server Actions (mutations)
        ├── Route Handlers (auth callbacks, webhooks, file uploads)
        ├── Middleware (auth guards, rate limiting)
        ├── NextAuth v5 (httpOnly cookie sessions)
        ├── Prisma 6 → PostgreSQL (Neon serverless)
        └── Ably (real-time messaging + notifications)
```

### Migration Strategy

1. **The Express server stays running in parallel during Phases 1–3** as a fallback safety net. The `web/` app will be progressively migrated domain-by-domain from Express API calls → Server Actions + Prisma queries.
2. **Feature flags are not needed** — we migrate domain by domain, and the old frontend (`client/`) is already a separate application. Each phase converts one domain completely before moving to the next.
3. **The Express server is decommissioned after Phase 4 is verified in production.** At that point, all traffic flows through Next.js Server Components/Actions → Prisma → PostgreSQL.
4. **`server/` and `client/` directories are moved to `_legacy/`** after Phase 4, then removed in a future cleanup commit.

### Confirmed Target Stack

| Layer | Current (as-is) | Target (to-be) | Migration Phase |
|---|---|---|---|
| **Framework** | Next.js 15.3.2 | Next.js 15 (App Router) | Already in place |
| **Language** | TypeScript 5 (strict) | TypeScript 5 (strict) | Already in place |
| **Rendering** | Client-side SPA (`'use client'` everywhere) | Server Components by default, Client Components only for interactivity | Phase 1–3 |
| **Auth** | ~~Zustand + localStorage JWT~~ | **NextAuth v5** (httpOnly cookie sessions, Credentials + future OAuth) | ✅ Phase 2 |
| **Database** | ~~MongoDB Atlas (via Express)~~ | **PostgreSQL (Neon serverless)** via **Prisma 6** | ✅ Phase 1 |
| **Data fetching** | ~~TanStack Query + fetch → Express API~~ | **Server Actions** (reads + mutations) | ✅ Phase 3 |
| **Real-time** | ~~Socket.IO client → Express Socket.IO server~~ | **Ably** (`@ably/react` hooks, server-side publish) — polling interim | Phase 4 |
| **File uploads** | Express + Multer + Cloudinary | **Cloudinary** (presigned upload URLs via Server Action) | Phase 2 |
| **UI** | shadcn/ui + Radix UI + Tailwind CSS v4 | Same — no change | Already in place |
| **Animations** | Framer Motion | Same — no change | Already in place |
| **Forms** | React Hook Form + Zod | Same — no change | Already in place |
| **Component dev** | Storybook 8 | Same — no change | Already in place |
| **State** | ~~Zustand (auth)~~ + ~~TanStack Query (server)~~ | Auth via NextAuth session; server state via Server Actions | ✅ Phase 2 (auth) / ✅ Phase 3 (data) |

### Transitional Dependencies (removed after migration)

These packages have been removed from `package.json`:

| Package | Purpose | Removed in |
|---|---|---|
| `axios` | HTTP client for Express API | ✅ Phase 3 |
| `@tanstack/react-query` | Client-side data fetching/caching | ✅ Phase 3 |
| `zustand` | Client-side auth state | ✅ Phase 2 |
| `socket.io-client` | Real-time messaging via Express | ✅ Phase 3 |
| `browser-image-compression` | Client-side image compression before upload | Phase 2 (replace with server-side) |

---

## B. Folder Structure

### Current Structure (as-is, post Phase 3)

```
web/src/
├── actions/
│   ├── applications.ts  # Apply, accept/reject, withdraw, get applications
│   ├── artist-profiles.ts # CRUD + search for artist profiles
│   ├── auth.ts          # Register, login, logout, forgot/reset password, verify email
│   ├── events.ts        # CRUD + search + my events
│   ├── genres.ts        # Get all genres (24h unstable_cache)
│   ├── networking.ts    # Connection requests: send, accept, reject, list
│   ├── notifications.ts # Get, mark read, delete, unread count
│   └── users.ts         # Profile update, password change, account settings, onboarding
├── app/
│   ├── (app)/           # Route group: authenticated app shell
│   │   ├── artists/     # Artist browse + detail
│   │   ├── chat/        # Placeholder (Phase 4: Ably integration)
│   │   ├── dashboard/   # Main dashboard + account-settings + edit-profile + notifications
│   │   ├── events/      # Event browse + detail + create + edit
│   │   ├── onboarding/  # Multi-step onboarding
│   │   └── layout.tsx   # App shell layout with Navbar
│   ├── (auth)/          # Route group: unauthenticated pages
│   │   └── auth/        # login, register, forgot-password, reset-password, verify-email
│   ├── globals.css
│   ├── layout.tsx       # Root layout (fonts, metadata, Providers)
│   └── page.tsx         # Landing page (animated hero)
├── components/
│   ├── applications/    # ApplicationForm, ApplicationsList, EventApplication
│   ├── artists/         # ArtistCard
│   ├── auth/            # LoginForm, RegisterForm, ResendVerification
│   ├── common/          # ErrorAlert, Pagination, Providers
│   ├── events/          # EventForm (merged create+edit), EventCard
│   ├── onboarding/      # OnboardingStepper + 7 step components
│   ├── profile/         # CreateArtistProfile, EditArtistProfile, ProfileSetup
│   └── ui/              # Navbar, Footer + shadcn components
├── lib/
│   ├── action-utils.ts  # AuthenticatedSession, requireAuth(), hasRole(), withActionHandler()
│   ├── auth.ts          # NextAuth v5 config
│   ├── auth.config.ts   # Edge-compatible auth config
│   ├── env.ts           # Zod-validated env vars
│   └── utils.ts         # cn() utility
├── types/               # Prisma-derived canonical types + filters + onboarding
├── validations/         # Zod schemas: users, artist-profiles, events, applications
└── stories/             # Storybook (placeholder stories)
```

**Deleted in Phase 3:**
- `hooks/` — All 8 TanStack Query hooks removed (replaced by server actions)
- `services/` — All 5 service files removed (replaced by server actions)
- `lib/api.ts` — Axios client removed
- `components/common/Chat.tsx` — Removed (Phase 4: Ably)
- `components/events/create-event-form.tsx` + `edit-event-form.tsx` — Merged into `event-form.tsx`
- `components/events/send-message-button.tsx` — Removed (Phase 4: Ably)

### Target Structure (to-be)

```
web/src/
├── app/
│   ├── (auth)/                    # Route group: unauthenticated pages
│   │   ├── login/
│   │   │   ├── page.tsx
│   │   │   └── loading.tsx         # NEW
│   │   ├── register/
│   │   │   ├── page.tsx
│   │   │   └── loading.tsx         # NEW
│   │   ├── forgot-password/
│   │   ├── reset-password/
│   │   ├── verify-email/
│   │   └── layout.tsx              # NEW: centered card layout for auth pages
│   ├── (app)/                     # Route group: authenticated app shell
│   │   ├── dashboard/
│   │   │   ├── page.tsx
│   │   │   ├── loading.tsx         # NEW
│   │   │   ├── account-settings/
│   │   │   ├── edit-profile/
│   │   │   └── notifications/
│   │   ├── events/
│   │   │   ├── page.tsx
│   │   │   ├── loading.tsx         # NEW
│   │   │   ├── error.tsx           # NEW
│   │   │   ├── create/
│   │   │   └── [id]/
│   │   │       ├── page.tsx
│   │   │       ├── loading.tsx     # NEW
│   │   │       └── edit/
│   │   ├── artists/
│   │   │   ├── page.tsx
│   │   │   ├── loading.tsx         # NEW
│   │   │   ├── create/
│   │   │   └── [id]/
│   │   │       ├── page.tsx
│   │   │       └── edit/
│   │   ├── chat/
│   │   │   └── page.tsx
│   │   ├── onboarding/
│   │   └── layout.tsx              # App shell layout with Navbar
│   ├── globals.css
│   ├── layout.tsx                  # Root layout (fonts, metadata, Providers)
│   ├── not-found.tsx               # NEW: global 404
│   ├── error.tsx                   # NEW: global error boundary
│   └── page.tsx                    # Landing page
├── components/
│   ├── applications/
│   ├── artists/
│   ├── auth/
│   ├── chat/                       # RENAMED from common/Chat
│   ├── events/
│   ├── layout/                     # RENAMED from ui/ — Navbar, Footer, Sidebar
│   ├── notifications/
│   ├── onboarding/
│   ├── profile/
│   ├── shared/                     # NEW: cross-domain reusable components
│   │   ├── empty-state.tsx
│   │   ├── confirm-dialog.tsx
│   │   ├── image-upload.tsx
│   │   ├── genre-selector.tsx
│   │   └── pagination.tsx          # MOVED from common/Pagination
│   └── ui/                         # shadcn components ONLY (auto-generated)
├── hooks/
│   ├── use-auth.ts                 # RENAMED (kebab-case)
│   ├── use-artists.ts
│   ├── use-chat.ts
│   ├── use-events.ts
│   ├── use-my-entities.ts
│   ├── use-notifications.ts
│   ├── use-onboarding.ts
│   ├── use-send-message.ts
│   └── use-update-application-status.ts
├── lib/
│   ├── api.ts                      # UPDATED: centralized Axios instance
│   ├── env.ts                      # NEW: Zod-validated process.env
│   ├── socket.ts                   # NEW: Socket.IO client singleton
│   └── utils.ts
├── services/                       # Domain-specific API call functions
│   ├── auth.ts
│   ├── artists.ts
│   ├── events.ts
│   ├── applications.ts
│   ├── messages.ts
│   ├── notifications.ts
│   ├── users.ts
│   └── genres.ts
├── store/
│   └── auth-store.ts               # RENAMED
├── types/                          # NEW
│   ├── index.ts                    # Re-exports
│   ├── api.ts                      # ApiResponse<T>, PaginatedResponse<T>
│   ├── auth.ts                     # AuthUser, Session
│   ├── artist.ts                   # IArtistProfile (mirrors Mongoose model)
│   ├── event.ts                    # IEventPosting (mirrors Mongoose model)
│   ├── application.ts              # IApplication
│   ├── message.ts                  # IMessage, IConversation
│   └── notification.ts             # INotification
└── stories/
    ├── EventCard.stories.tsx        # REPLACE stubs with real component stories
    ├── ArtistCard.stories.tsx
    └── ApplicationCard.stories.tsx
```

### Key Structural Changes

1. **Route groups** `(auth)` and `(app)` — clean separation of authenticated vs public layout
2. **`types/`** — centralized TypeScript interfaces mirroring the Mongoose models; eliminates `any` across the codebase
3. **`lib/env.ts`** — crash-early validated env vars
4. **`lib/socket.ts`** — Socket.IO client as a singleton (currently created ad-hoc in `Chat.tsx`)
5. **Kebab-case file names** — Next.js and shadcn convention; currently mixed PascalCase
6. **`components/shared/`** — reusable UI pieces (pagination, image upload, genre selector, empty state)
7. **Storybook stories** — replace the default Create React App placeholder stories with actual SoundTribe component stories

---

## C. Feature Completion Checklist

Accuracy-audited against actual source files (not guessed).

### Auth

| Feature | Status | File | Notes |
|---|---|---|---|
| Register (form + server action) | ✅ Working | `actions/auth.ts` + `components/auth/register-form.tsx` | NextAuth Credentials provider, bcrypt, Prisma |
| Login (form + httpOnly cookie) | ✅ Working | `actions/auth.ts` + `components/auth/login-form.tsx` | JWT in httpOnly cookie, no localStorage |
| Logout (server action) | ✅ Working | `actions/auth.ts` + Navbar | `signOut()` from next-auth/react |
| Middleware route protection | ✅ Working | `middleware.ts` + `lib/auth.config.ts` | Edge-compatible, protects all (app) routes |
| Session management | ✅ Working | `lib/auth.ts` | JWT strategy, 30-day maxAge, SessionProvider in providers.tsx |
| Type-safe session | ✅ Working | `types/next-auth.d.ts` | Module augmentation: id, roles, onboardingComplete, onboardingStep, username, profileImage |
| Forgot password flow | 🟡 UI + action | `auth/forgot-password/` + `actions/auth.ts` | Server action exists; email sending placeholder (Phase 4) |
| Reset password flow | 🟡 UI + action | `auth/reset-password/` + `actions/auth.ts` | Same |
| Email verification | 🟡 UI + action | `auth/verify-email/` + `actions/auth.ts` | Token generation works; email delivery pending |
| Token refresh / expiry handling | ✅ Handled | NextAuth manages cookie refresh automatically | No manual refresh needed |

### Onboarding

| Feature | Status | File | Notes |
|---|---|---|---|
| 7-step onboarding stepper | ✅ Working | `components/onboarding/OnboardingStepper.tsx` | |
| Role selection (multi) | ✅ Working | `steps/RoleStep.tsx` | Roles: artist, organizer, enthusiast, collaborator, networker |
| Preferences (genres, instruments, etc.) | ✅ Working | `steps/PreferencesStep.tsx` | |
| Location | ✅ Working | `steps/LocationStep.tsx` | |
| Availability | ✅ Working | `steps/AvailabilityStep.tsx` | |
| Profile (name, bio) | ✅ Working | `steps/ProfileStep.tsx` | |
| Notification preferences | ✅ Working | `steps/NotificationsStep.tsx` | |
| Summary + confirm | ✅ Working | `steps/SummaryStep.tsx` | |
| Progress persistence | ✅ Working | `onboardingStep` field on User, saved per step | |
| Redirect to onboarding if incomplete | 🟡 Partial | `dashboard/page.tsx` checks `onboardingComplete` | Only on dashboard, not a global guard |

### User Profile & Settings

| Feature | Status | File | Notes |
|---|---|---|---|
| View account settings | ✅ Working | `dashboard/account-settings/` | |
| Edit profile (name, bio, location) | ✅ Working | `dashboard/edit-profile/` | |
| Profile image upload | 🟡 Unclear | — | `browser-image-compression` is installed; unclear if upload to Cloudinary is wired |
| Change password | 🟡 Partial | — | Part of forgot-password flow, not account settings |
| Notification preferences | ✅ Working | Set during onboarding; unknown if editable in settings |

### Events

| Feature | Status | File | Notes |
|---|---|---|---|
| Browse events (list + filters) | ✅ Working | `app/events/page.tsx` + `actions/events.ts` | Genre + location filters via server actions |
| Event detail page | ✅ Working | `app/events/[id]/page.tsx` | |
| Create event posting | ✅ Working | `app/events/create/` + `EventForm.tsx` | Merged create/edit form |
| Edit event posting | ✅ Working | `app/events/edit/[id]/` + `EventForm.tsx` | Same merged form |
| Delete event | 🟡 Partial | — | Exists in Express controller but unclear if wired in web/ UI |
| Pagination | ✅ Working | `components/common/Pagination.tsx` + `useEvents` pagination support | |
| "My events" (organizer view) | ✅ Working | `dashboard/page.tsx` via `getMyEventsAction` | |

### Artist Profiles

| Feature | Status | File | Notes |
|---|---|---|---|
| Create artist profile | ✅ Working | `components/profile/CreateArtistProfile.tsx` | |
| Edit artist profile | ✅ Working | `app/artists/edit/[id]/` + `components/profile/EditArtistProfile.tsx` | |
| Browse artists (list + filters) | ✅ Working | `app/artists/page.tsx` + `actions/artist-profiles.ts` | |
| Artist detail page | ✅ Working | `app/artists/[id]/page.tsx` | |
| Portfolio items (audio/video/image) | ✅ Model + form | `ArtistProfile.ts` model has `portfolioItems[]` | Display implementation needs verification |
| Availability display | 🟡 Partial | Set in onboarding; not sure if shown on artist card/detail |

### Applications

| Feature | Status | File | Notes |
|---|---|---|---|
| Apply to event (with message) | ✅ Working | `components/applications/ApplicationForm.tsx` | |
| View applications on event | ✅ Working | `components/applications/ApplicationsList.tsx` | Organizer view |
| Accept / reject application | ✅ Working | `actions/applications.ts` | |
| My applications (artist view) | ✅ Working | `dashboard/page.tsx` via `getMyApplicationsAction` | |
| Withdraw application | ✅ Working | `actions/applications.ts` | `withdrawApplicationAction` |

### Messaging

| Feature | Status | File | Notes |
|---|---|---|---|
| Full-page chat UI | 🔴 Placeholder | `app/chat/page.tsx` | "Coming soon" — pending Ably integration (Phase 4) |
| Send text messages | 🔴 Pending | — | Requires Ably (Phase 4) |
| Send file attachments | 🔴 Pending | — | Requires Ably (Phase 4) |
| Message reactions (emoji) | 🔴 Pending | — | Requires Ably (Phase 4) |
| Read / Delivered / Sent status | 🔴 Pending | — | Requires Ably (Phase 4) |
| Typing indicators | 🔴 Pending | — | Requires Ably (Phase 4) |
| Real-time via Ably | 🔴 Pending | — | Phase 4 |
| Entity-to-entity messaging | 🔴 Pending | — | Phase 4 |

### Notifications

| Feature | Status | File | Notes |
|---|---|---|---|
| Notification list page | ✅ Working | `dashboard/notifications/page.tsx` + `actions/notifications.ts` | |
| Mark as read | ✅ Working | `actions/notifications.ts` | |
| Real-time push | 🟡 Polling | Navbar polls `getUnreadCountAction` every 30s | Ably in Phase 4 |
| Notification badge in Navbar | ✅ Working | `components/ui/Navbar.tsx` | Red badge with unread count |

### Genres

| Feature | Status | File | Notes |
|---|---|---|---|
| Genre list (from server action) | ✅ Working | `actions/genres.ts` | 24h `unstable_cache` |
| Genre selector in forms | ✅ Working | Used in EventForm, profile forms | |

---

## D. Bug & Issue Registry

### 🔴 Critical (blocks core functionality or is a security issue)

**BUG-001: JWT in localStorage (XSS vulnerability)** ✅ FIXED Phase 2
JWT access tokens stored in `localStorage` are readable by any JavaScript on the page.
_Fix:_ Migrated to NextAuth v5 httpOnly cookie sessions. No tokens in localStorage.

**BUG-002: No middleware-level auth guard** ✅ FIXED Phase 2
Any user can navigate directly to `/events/create`, `/dashboard`, etc. without being logged in.
_Fix:_ Added `middleware.ts` with NextAuth edge-compatible config. All `(app)` routes protected.

**BUG-003: Token expiry not handled** ✅ FIXED Phase 2
When the JWT expires, API calls silently fail.
_Fix:_ NextAuth manages JWT refresh automatically via httpOnly cookies. No manual interceptor needed.

**BUG-004: No validated environment variables** ✅ FIXED Phase 2 + Phase 3
`process.env.NEXT_PUBLIC_API_URL` and `process.env.NEXT_PUBLIC_SOCKET_URL` are referenced directly with `|| 'http://localhost:5000'` fallbacks.
_Fix:_ Added `src/lib/env.ts` with Zod validation. `NEXT_PUBLIC_API_URL` and `NEXT_PUBLIC_SOCKET_URL` fully removed in Phase 3.

**BUG-005: Inconsistent API base URL** ✅ FIXED Phase 3
Some fetch calls in `dashboard/page.tsx` use `/api/...` while `services/api.ts` uses `NEXT_PUBLIC_API_URL`.
_Fix:_ All data fetching now goes through Server Actions + Prisma. No API base URL needed. Axios removed.

**BUG-006: Socket.IO client created on every Chat render** ✅ FIXED Phase 3
`io()` is called inside the `Chat` component's body on every mount.
_Fix:_ Socket.IO client fully removed. Chat page is now a placeholder pending Ably integration (Phase 4).

### 🟡 Moderate (degraded UX or data integrity risk)

**BUG-007: `any` types pervasive throughout** ✅ FIXED Phase 3
`dashboard/page.tsx` uses `useState<any[]>` for events, artists, applications.
_Fix:_ All types derived from Prisma schema. Server Actions have typed `ActionResult<T>` returns. Zero `any` casts remain in data layer.

**BUG-008: Storybook stories are Create React App placeholders**
`src/stories/` contains the default CRA Storybook stories (Button, Header, Page) — not SoundTribe components. Storybook is set up but provides zero value.
_Fix:_ Replace with real stories: `EventCard.stories.tsx`, `ArtistCard.stories.tsx`, `ApplicationCard.stories.tsx`.

**BUG-009: No `loading.tsx` or `error.tsx` in any route segment**
Data-heavy pages (events list, dashboard) show a blank screen during data fetch. React errors bubble to the root and show the default crash page.
_Fix:_ Add `loading.tsx` (skeleton UIs) and `error.tsx` (recovery UI) to all major route segments.

**BUG-010: Onboarding stepper doesn't persist current step on refresh**
`OnboardingStepper.tsx` uses local `useState` for the current step. Refreshing the page resets to Step 1, even if the user was on Step 5.
_Fix:_ Initialize step from `onboarding.onboardingStep` (which is persisted in the User model).

**BUG-011: App layout includes Navbar on auth pages**
`layout.tsx` wraps everything including auth routes with `<Navbar />`. Login/register pages should have a minimal layout (just the centered card, no nav).
_Fix:_ Use route groups `(auth)` and `(app)` with separate layouts.

**BUG-012: No global 404 page**
Navigating to a non-existent route shows Next.js's default 404. No SoundTribe branding.
_Fix:_ Add `app/not-found.tsx`.

**BUG-013: Root `layout.tsx` has placeholder metadata**
`title: 'Create Next App'` — the default Next.js starter metadata is still in production.
_Fix:_ Update metadata: title, description, OG tags, favicon.

**BUG-014: `useMyEntities` hook is a single integration point for all messaging**
The hook fetches all entities (ArtistProfiles + Events) that belong to the current user. If this fetch fails, the entire chat UI breaks. No error state displayed.
_Fix:_ Add error boundary around chat; show "Couldn't load your profiles" with a retry button.

**BUG-015: No empty state UIs on browse pages**
If events list returns 0 results after filtering, the page shows nothing. No "No events found" message, no suggestion to reset filters.
_Fix:_ Add `components/shared/empty-state.tsx` and use it on events, artists, applications lists.

**BUG-016: `EditEventForm` and `CreateEventForm` are separate components with duplicated logic** ✅ FIXED Phase 3
Both forms have the same field definitions, the same validation, the same genre fetching.
_Fix:_ Merged into single `EventForm` component with `mode: 'create' | 'edit'` and optional `initialData` prop.

**BUG-017: Application withdrawal not implemented** ✅ FIXED Phase 3
An artist cannot cancel or withdraw a pending application.
_Fix:_ Added `withdrawApplicationAction` in `actions/applications.ts`.

**BUG-018: No accessibility on icon-only buttons**
Multiple icon-only buttons (notification bell, chat menu, reaction picker toggle) have no `aria-label`. Screen readers cannot navigate the app.
_Fix:_ Add `aria-label` to all icon-only interactive elements.

### 🟢 Minor (polish, clean-up, nice-to-have)

**BUG-019: File naming is inconsistently PascalCase** — `LoginForm.tsx`, `EventCard.tsx` (should be `login-form.tsx`, `event-card.tsx` per Next.js convention).

**BUG-020: `ui/Navbar.tsx` and `ui/Footer.tsx` are in `components/ui/`** — the `ui/` directory is reserved for shadcn auto-generated components. Custom layout components belong in `components/layout/`.

**BUG-021: Chat component is 800+ lines** ✅ FIXED Phase 3
`components/common/Chat.tsx` handles conversations list, message thread, socket management, emoji picker, and file upload all in one component.
_Fix:_ Entire Chat.tsx deleted. Will be rebuilt from scratch as decomposed components (conversation-list, message-thread, message-input) with Ably in Phase 4.

**BUG-022: Storybook default stories pollute component stories** — `src/stories/Button.tsx` is the CRA default Button, not a SoundTribe component.

**BUG-023: `package.json` has no test script** — `vitest` is a devDependency but there's no `"test"` script in `package.json`.

**BUG-024: No `robots.txt` or `sitemap.xml`** — Missing basic SEO infrastructure.

**BUG-025: Landing page CTAs link to `#explore` and `#events` anchors that don't exist** — The scroll CTAs at the bottom of the hero section point to anchors not present on the page.

**BUG-026: `@types/axios` is in devDependencies** — `axios` v1+ ships its own types; `@types/axios` is deprecated and should be removed.

---

## E. Implementation Roadmap

Each phase produces a **shippable, working increment**. No phase leaves the app in a broken state.

### Phase 0 — Scaffold ✅
**Goal:** Next.js 15 App Router shell with route stubs, layouts, and shared UI (shadcn/ui).

**Delivered:**
- `(app)` and `(auth)` route groups with layout separation
- Theme switcher (dark / light / system)
- All route stubs matching the original `client/` SPA
- shadcn/ui component library bootstrapped (Button, Card, Dialog, Input, etc.)
- Tailwind CSS v4 configured

**Commits:** `9fa3f01`, `20a598b`

---

### Phase 1 — Database Migration ✅
**Goal:** PostgreSQL schema via Prisma, seeded genre list, Neon serverless adapter.

**Delivered:**
- Prisma schema (`prisma/schema.prisma`) with all 10 models: User, ArtistProfile, Event, Application, Message, Conversation, Notification, Genre, SocialLinks, EventDateRange
- Initial migration (`0001_init`)
- Seed script with 15 genre-neutral genres (Rock, Pop, Hip Hop, Jazz, Classical, Country, R&B, Electronic, Folk, Blues, Metal, Reggae, Latin, Soul, Punk)
- TypeScript types generated from Prisma (`types/prisma.ts`)

**Commits:** `3964553`

---

### Phase 2 — Auth Migration ✅
**Goal:** Replace Zustand + localStorage JWT with NextAuth v5 (httpOnly cookie sessions).

**Delivered:**
- NextAuth v5 (beta.30) with Credentials provider + PrismaAdapter
- JWT strategy with 30-day maxAge, httpOnly cookies
- Edge-compatible split: `auth.config.ts` (middleware) + `auth.ts` (full config with Prisma/bcrypt)
- Server Actions for register / login / logout (`actions/auth.ts`)
- `SessionProvider` in root layout for client-side `useSession()`
- Middleware route protection for all `(app)` routes
- Module-augmented session type: `{ id, username, roles, onboardingComplete, onboardingStep, profileImage }`
- Zustand auth store removed; all TanStack Query hooks disabled with `enabled: false` + `TODO(phase-3)` comments
- Dashboard pages use `session?.user as any` for extended profile fields — flagged with `TODO(phase-3)`

**Commits:** `c92ef43`

#### Phase 2 Decisions

| Decision | Rationale |
|---|---|
| **JWT strategy** (not database sessions) | Simpler for beta; no extra DB round-trip per request. Can switch to database strategy later by changing one line in `auth.ts`. |
| **Split config** (`auth.config.ts` + `auth.ts`) | `auth.config.ts` is edge-compatible (no Node.js deps) and used by `middleware.ts`. `auth.ts` imports Prisma + bcrypt and runs only in Node.js runtime. |
| **Disabled TanStack Query hooks** | All hooks still reference `token` from the removed Zustand store. Rather than rewrite them now, we set `enabled: false` and will replace them with Server Actions in Phase 3. |
| **`as any` casts on dashboard pages** | Dashboard pages read extended profile fields (firstName, lastName, bio, etc.) from `session?.user`. These are not in the NextAuth session type yet. Flagged with `TODO(phase-3)` — will be replaced when dashboard pages fetch profile data via Server Components. |
| **PrismaAdapter `as any`** | NextAuth v5 beta.30 `@auth/prisma-adapter` types lag behind Prisma 6. The cast is harmless at runtime. Tracked as `TODO(phase-3)`. |

---

### Phase 3 — Server Actions & Data Layer ✅
**Goal:** Replace all TanStack Query hooks + Axios calls with Server Actions. Zero dependency on Express server. Zero `any` types.

**Delivered:**
- `ActionResult<T>` pattern: `{ success: true; data: T } | { success: false; error: string; fieldErrors?: Record<string, string[]> }`
- `AuthenticatedSession` interface extending NextAuth `Session` with guaranteed `user.id: string`
- `requireAuth()` / `hasRole()` / `withActionHandler()` helpers in `lib/action-utils.ts`
- 7 server action files covering all domains: auth, events, artists, applications, users, genres, notifications, networking
- 4 Zod validation schemas: users, artist-profiles, events, applications
- `OnboardingState` type extracted to `types/onboarding.ts`
- All pages migrated from `useEffect` + API fetch to direct server action calls
- Merged duplicate `CreateEventForm` + `EditEventForm` → single `EventForm`
- Navbar notifications: Socket.IO replaced with 30s polling via `getUnreadCountAction`
- Providers simplified: `QueryClientProvider` removed, only `SessionProvider` remains
- All transitional types removed (IUser, IEventPosting, IArtistProfile, etc.)
- Chat page: placeholder "coming soon" (Phase 4: Ably)
- Packages uninstalled: `axios`, `@tanstack/react-query`, `socket.io-client`
- 8 hooks deleted, 5 services deleted, `lib/api.ts` deleted

**Commits:** `efb405b`, `2ebe0a6`, `e9e414a`, `6866feb`, `a4474bb`

#### Phase 3 Decisions

| Decision | Rationale |
|---|---|
| **Server Actions for reads too** (not just mutations) | Simpler than mixing Server Components + Server Actions. All pages are `'use client'` and call actions directly. Can migrate to RSC later. |
| **ActionResult<T> pattern** | Consistent error handling across all actions. No try/catch in components — just check `result.success`. |
| **AuthenticatedSession type** | `session.user.id` is `string \| undefined` in NextAuth types. Creating `AuthenticatedSession` avoids `as string` casts everywhere. |
| **Prisma.JsonNull for nullable JSON** | Prisma requires `Prisma.JsonNull` (not `null`) for JSON? columns. Caught by TypeScript strict mode. |
| **Inferred return types on actions** | Explicit `ReturnType<typeof db...>` doesn't capture Prisma `include` types. Letting TypeScript infer gives correct types. |
| **Polling over WebSockets** | Socket.IO removed; Ably not yet integrated. 30s interval for notification count is sufficient interim. |
| **Chat placeholder** | Full chat requires Ably (Phase 4). Placeholder avoids broken imports. |

---

### Phase 4 — Real-time via Ably + Chat (next up)
**Goal:** Replace Socket.IO with Ably. Rebuild chat. Live messaging + notification push.
**Product Vision link:** Real-time is core to the marketplace feel.

Files to **create:**
- `src/lib/ably.ts` — Server-side Ably client
- `src/app/api/ably-auth/route.ts` — Token auth endpoint for Ably client SDK
- `src/hooks/use-ably.ts` — Custom channel subscription hook
- `src/components/chat/conversation-list.tsx`
- `src/components/chat/message-thread.tsx`
- `src/components/chat/message-input.tsx`

Files to **modify:**
- `src/app/(app)/chat/page.tsx` — Replace placeholder with full chat UI
- `src/components/ui/Navbar.tsx` — Replace 30s polling with Ably channel subscription

---

### Phase 5 — Applications Completeness
**Goal:** Full apply → review → accept/reject → withdraw loop via Server Actions.
**Product Vision link:** "Completed Connection" is the North Star metric — this is the most direct path to it.

Files to **create:**
- `hooks/use-withdraw-application.ts`

Files to **modify:**
- Express `server/src/controllers/applicationController.ts` — Add `DELETE /applications/:id` (artist can only delete own pending application)
- Express `server/src/routes/applicationRoutes.ts` — Wire the route
- `components/applications/ApplicationsList.tsx` — Add "Withdraw" button for artist's pending applications
- `app/dashboard/page.tsx` — Show cleaner applications section with withdraw action

**Commits:** `feat: artist can withdraw pending application`, `fix: application list shows withdraw action`

---

### Phase 5 — Applications Completeness
**Goal:** Full apply → review → accept/reject → withdraw loop via Server Actions.

---

### Phase 6 — Loading States, Error Boundaries & Polish
**Goal:** Add loading.tsx, error.tsx, empty states, and skeleton UIs to all routes.

---

### Phase 7 — Storybook & Component Documentation
**Goal:** Every major component has a Storybook story.

---

### Phase 8 — SEO & Metadata
**Goal:** Landing page ranks. Artist/event pages are shareable.

---

### Phase 9 — Testing
**Goal:** Confidence in auth, CRUD, and application flows. Vitest for Server Actions, Playwright for e2e.

---

### Phase 10 — Deployment & CI/CD + Express Decommission
**Goal:** One-command deploy. Express server decommissioned. `server/` and `client/` moved to `_legacy/`.

Files to **create:**
- `.github/workflows/ci.yml` — Lint + type-check + test on every PR
- `web/docs/DEPLOYMENT.md` — Vercel + Neon + Cloudinary + Ably setup guide

Files to **delete/archive:**
- `server/` → `_legacy/server/`
- `client/` → `_legacy/client/`
- Remove all transitional dependencies from `web/package.json`: `axios`, `@tanstack/react-query`, `zustand`, `socket.io-client`, `browser-image-compression`

---

### Phase 11 — Monetization Infrastructure
**Goal:** Implement Organizer Subscription (Model A) + Featured Listings (Model D).
**Timing:** Per [docs/PRODUCT_VISION.md](docs/PRODUCT_VISION.md) §6, not before 6 months post-launch.

> With full-stack Next.js in place, Stripe webhooks can be handled via Route Handlers (`app/api/webhooks/stripe/route.ts`) — no separate server needed.

Files to **create (planned):**
- `src/app/api/webhooks/stripe/route.ts`
- `prisma/` — Add Subscription model to schema
- `src/app/(app)/billing/page.tsx`
- `src/actions/billing.ts`

---

## Appendix: Environment Variables Reference

All variables validated by `src/lib/env.ts`. App throws a clear error at startup if any required variable is missing.

### Required (all environments)

| Variable | Description |
|---|---|
| `DATABASE_URL` | PostgreSQL connection string (Neon) |
| `AUTH_SECRET` | NextAuth secret (min 32 chars) |
| `NEXTAUTH_URL` | Full URL of the app (e.g. `https://soundtribe.vercel.app`) |
| `CLOUDINARY_CLOUD_NAME` | Cloudinary cloud name |
| `CLOUDINARY_API_KEY` | Cloudinary API key |
| `CLOUDINARY_API_SECRET` | Cloudinary API secret |
| `ABLY_API_KEY` | Server-side Ably API key |
| `NEXT_PUBLIC_ABLY_KEY` | Client-side Ably publishable key |

### Legacy (removed in Phase 3 — no longer needed)

| Variable | Description |
|---|---|
| ~~`NEXT_PUBLIC_API_URL`~~ | Express API URL — removed |
| ~~`NEXT_PUBLIC_SOCKET_URL`~~ | Socket.IO server URL — removed |

## Appendix: How to Run Everything Locally

### Current (post Phase 3) — Express no longer needed
```bash
cd web
npm install
npx prisma generate
npx prisma db push     # or: npx prisma migrate dev
npx prisma db seed     # seeds genres
# create .env.local with all required vars (see .env.example)
npm run dev            # runs on http://localhost:3000
```

### Legacy (Phases 0–2 only) — Express was still needed
```bash
# Terminal 1: Express backend (no longer required)
cd server
npm install
cp .env.example .env   # fill in MONGODB_URI, JWT_SECRET, CLOUDINARY_*
npm run dev            # runs on http://localhost:5000

# Terminal 2: Next.js frontend
cd web
npm install
# .env.local must include NEXT_PUBLIC_API_URL and NEXT_PUBLIC_SOCKET_URL
npm run dev            # runs on http://localhost:3000
```

## Appendix: Hosting Setup

### Current (post Phase 3)

| Service | Platform | Notes |
|---|---|---|
| Next.js App (full-stack) | **Vercel** (free Hobby) | Server Components + Server Actions + Route Handlers |
| PostgreSQL | **Neon** (free tier) | Serverless, auto-scales, generous free tier |
| Images | **Cloudinary** (free tier) | 25GB storage, 25GB bandwidth/month |
| Real-time | **Ably** (free tier) — Phase 4 | 6M messages/month |

### Legacy (Phases 0–2 — no longer needed)

| Service | Platform | Notes |
|---|---|---|
| ~~Express API + Socket.IO~~ | ~~Render~~ | Decommissioned — no longer required |
| ~~MongoDB~~ | ~~MongoDB Atlas~~ | Decommissioned — all data in PostgreSQL |
