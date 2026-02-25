# SoundTribe — Architecture Decision Document

> **Living document.** Last updated: 2026-02-25.
> Read [docs/PRODUCT_VISION.md](docs/PRODUCT_VISION.md) first for product context.
> All architectural decisions exist to serve the product vision — when they conflict, the product vision wins.

---

## Grounding Reality: What the Codebase Actually Is

Before any decisions, it's critical to document the **real** current state — not what was intended, but what exists.

### What `web/` actually is today

`web/` is a **Next.js 15 (App Router) application** in a transitional state between client-side SPA and full-stack Next.js.

**Completed (Phases 0–2):**
- ✅ Prisma 6 + PostgreSQL (Neon) as the database layer
- ✅ NextAuth v5 with Credentials provider, JWT strategy, httpOnly cookie sessions
- ✅ Middleware-level route protection (auth.config.ts + middleware.ts)
- ✅ Server Actions for auth flows (login, register, logout)
- ✅ Zod-validated environment variables (lib/env.ts)
- ✅ TypeScript types for all domain models (types/)

**Still in transition (waiting for Phase 3):**
- ❌ TanStack Query hooks are disabled (`enabled: false`) — all data still comes from Express API
- ❌ Server Components not yet used for data fetching
- ❌ Express API still required for CRUD operations

`web/` currently uses:
- ✅ Next.js 15 with Turbopack
- ✅ **NextAuth v5** (httpOnly cookie sessions, JWT strategy, Prisma adapter)
- ✅ **Prisma 6** → PostgreSQL (Neon serverless)
- ✅ The legacy **Express.js + MongoDB API** (`server/`) for data CRUD — via fetch at `NEXT_PUBLIC_API_URL`
- ✅ **TanStack Query v5** for data fetching (all hooks disabled pending Phase 3 migration)
- ✅ **Socket.IO client** for real-time messaging
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

### The Actual Architecture (as-is, post Phase 2)

```
Browser
  └── web/ (Next.js 15 — transitional)
        ├── NextAuth v5 (httpOnly cookie JWT sessions)
        ├── Prisma 6 → PostgreSQL (Neon) — auth only, CRUD pending Phase 3
        ├── Server Actions (auth flows: login, register, logout)
        ├── Middleware (route protection via auth.config.ts)
        ├── TanStack Query (disabled — all hooks have enabled: false)
        ├── Socket.IO client (real-time chat — still connects to Express)
        └── fetch() ──────────────────► server/ (Express.js on Render)
                                                     ├── MongoDB Atlas
                                                     ├── Cloudinary (images)
                                                     └── Socket.IO server
```

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
| **Data fetching** | TanStack Query + fetch → Express API | **Server Components** (reads) + **Server Actions** (mutations) | Phase 3 |
| **Real-time** | Socket.IO client → Express Socket.IO server | **Ably** (`@ably/react` hooks, server-side publish) | Phase 4 |
| **File uploads** | Express + Multer + Cloudinary | **Cloudinary** (presigned upload URLs via Server Action) | Phase 2 |
| **UI** | shadcn/ui + Radix UI + Tailwind CSS v4 | Same — no change | Already in place |
| **Animations** | Framer Motion | Same — no change | Already in place |
| **Forms** | React Hook Form + Zod | Same — no change | Already in place |
| **Component dev** | Storybook 8 | Same — no change | Already in place |
| **State** | ~~Zustand (auth)~~ + TanStack Query (server) | Auth via NextAuth session; server state via RSC | ✅ Phase 2 (auth) / Phase 3 (data) |

### Transitional Dependencies (removed after migration)

These packages are currently in `package.json` and will be removed domain-by-domain:

| Package | Purpose | Remove in |
|---|---|---|
| `axios` | HTTP client for Express API | Phase 3 |
| `@tanstack/react-query` | Client-side data fetching/caching | Phase 3 |
| `zustand` | Client-side auth state | ✅ Removed in Phase 2 |
| `socket.io-client` | Real-time messaging via Express | Phase 4 |
| `browser-image-compression` | Client-side image compression before upload | Phase 2 (replace with server-side) |

---

## B. Folder Structure

### Current Structure (as-is)

```
web/src/
├── app/
│   ├── artists/        # Artist browse + detail + create + edit
│   ├── auth/           # login, register, forgot-password, reset-password, verify-email
│   ├── chat/           # Full-page chat
│   ├── dashboard/      # Main dashboard + account-settings + edit-profile + notifications
│   ├── events/         # Event browse + detail + create + edit
│   ├── onboarding/     # Multi-step onboarding
│   ├── globals.css
│   ├── layout.tsx      # Root layout: Navbar + Footer + Providers
│   └── page.tsx        # Landing page (animated hero)
├── components/
│   ├── applications/   # ApplicationForm, ApplicationsList, EventApplication
│   ├── artists/        # ArtistCard
│   ├── auth/           # LoginForm, RegisterForm, ResendVerification
│   ├── common/         # Chat, ErrorAlert, Pagination, Providers
│   ├── events/         # CreateEventForm, EditEventForm, EventCard, SendMessageButton
│   ├── onboarding/     # OnboardingStepper + 7 step components
│   ├── profile/        # CreateArtistProfile, EditArtistProfile, ProfileSetup
│   └── ui/             # Navbar, Footer (NOT shadcn — these are custom)
├── hooks/              # useAuth, useArtists, useChat, useEvents, useMyEntities,
│                       # useNotifications, useOnboarding, useSendMessage,
│                       # useUpdateApplicationStatus
├── lib/
│   └── utils.ts        # cn() utility only
├── services/           # api.ts (axios), event.ts, genre.ts, getUserProfile.ts, user.ts
├── store/
│   └── authStore.ts    # Zustand auth store
└── stories/            # Storybook (generic placeholder stories — not real component stories yet)
```

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
| Forgot password flow | 🟡 UI only | `auth/forgot-password/` | Page exists, backend endpoint not wired |
| Reset password flow | 🟡 UI only | `auth/reset-password/` | Same |
| Email verification | 🟡 UI only | `auth/verify-email/` | Backend model has the fields; frontend flow unclear |
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
| Browse events (list + filters) | ✅ Working | `app/events/page.tsx` + `useEvents` hook | Genre + location filters implemented |
| Event detail page | ✅ Working | `app/events/[id]/page.tsx` | |
| Create event posting | ✅ Working | `app/events/create/` + `CreateEventForm.tsx` | Rich form with all model fields |
| Edit event posting | ✅ Working | `app/events/edit/[id]/` + `EditEventForm.tsx` | |
| Delete event | 🟡 Partial | — | Exists in Express controller but unclear if wired in web/ UI |
| Pagination | ✅ Working | `components/common/Pagination.tsx` + `useEvents` pagination support | |
| "My events" (organizer view) | ✅ Working | `dashboard/page.tsx` fetches `/api/event-postings/user` | Not a dedicated page though |

### Artist Profiles

| Feature | Status | File | Notes |
|---|---|---|---|
| Create artist profile | ✅ Working | `components/profile/CreateArtistProfile.tsx` | |
| Edit artist profile | ✅ Working | `app/artists/edit/[id]/` + `components/profile/EditArtistProfile.tsx` | |
| Browse artists (list + filters) | ✅ Working | `app/artists/page.tsx` + `useArtists` hook | |
| Artist detail page | ✅ Working | `app/artists/[id]/page.tsx` | |
| Portfolio items (audio/video/image) | ✅ Model + form | `ArtistProfile.ts` model has `portfolioItems[]` | Display implementation needs verification |
| Availability display | 🟡 Partial | Set in onboarding; not sure if shown on artist card/detail |

### Applications

| Feature | Status | File | Notes |
|---|---|---|---|
| Apply to event (with message) | ✅ Working | `components/applications/ApplicationForm.tsx` | |
| View applications on event | ✅ Working | `components/applications/ApplicationsList.tsx` | Organizer view |
| Accept / reject application | ✅ Working | `hooks/useUpdateApplicationStatus.ts` | |
| My applications (artist view) | ✅ Working | `dashboard/page.tsx` fetches `/api/applications/my-applications` | |
| Withdraw application | 🔴 Missing | — | Not in Express controller or web/ UI |

### Messaging

| Feature | Status | File | Notes |
|---|---|---|---|
| Full-page chat UI | ✅ Working | `app/chat/page.tsx` + `components/common/Chat.tsx` | Rich UI: conversations list + message thread |
| Send text messages | ✅ Working | `hooks/useSendMessage.ts` | |
| Send file attachments | ✅ Working | Implemented in Chat.tsx | |
| Message reactions (emoji) | ✅ Working | `hooks/useChat.ts` → `useAddReaction` | |
| Read / Delivered / Sent status | ✅ Working | Message model + Socket.IO events (last commit: "polish messenger, add read/delivered/sent indicators") | |
| Typing indicators | ✅ Working | Socket.IO `typing` events in Chat.tsx | |
| Real-time via Socket.IO | ✅ Working | Socket.IO client in Chat.tsx; server has Socket.IO | |
| Entity-to-entity messaging (ArtistProfile ↔ Event) | ✅ Working | `useMyEntities` hook fetches user's entities; sender selection in Chat UI | |
| Emoji picker in input | ✅ Working | Chat.tsx has `showInputEmojiPicker` state | |
| Delete conversation | ✅ Working | `useDeleteConversation` hook | |
| Message deep-link (open chat with specific user) | ✅ Working | Chat reads `?senderId=&receiverId=` from URL params | |
| Unread message count in sidebar | 🟡 Partial | `useUnreadCounts` hook exists; integration in Navbar unclear |

### Notifications

| Feature | Status | File | Notes |
|---|---|---|---|
| Notification list page | ✅ Working | `dashboard/notifications/page.tsx` | |
| Mark as read | ✅ Working | `hooks/useNotifications.ts` | |
| Real-time push | 🟡 Socket.IO | Server emits notification events; unclear if web/ subscribes to them |
| Notification badge in Navbar | 🟡 Partial | `useNotifications` hook exists; badge integration unclear |

### Genres

| Feature | Status | File | Notes |
|---|---|---|---|
| Genre list (from API) | ✅ Working | `services/genre.ts` | |
| Genre selector in forms | ✅ Working | Used in CreateEventForm, EditEventForm, profile forms | |

---

## D. Bug & Issue Registry

### 🔴 Critical (blocks core functionality or is a security issue)

**BUG-001: JWT in localStorage (XSS vulnerability)**
JWT access tokens stored in `localStorage` are readable by any JavaScript on the page. An XSS attack anywhere on the domain can steal the token.
_Fix:_ Move to `httpOnly` cookies via a Next.js API route proxy that sets the cookie, or at minimum add a `Content-Security-Policy` header.

**BUG-002: No middleware-level auth guard**
Any user can navigate directly to `/events/create`, `/dashboard`, etc. without being logged in. Protection is only via `useEffect` redirects (client-side), which means the page flashes before redirect, and server-rendered content can leak.
_Fix:_ Add `middleware.ts` that checks for a valid auth token and redirects to `/auth/login` for protected routes.

**BUG-003: Token expiry not handled**
When the JWT expires, API calls silently fail. There's no Axios interceptor catching 401 responses to redirect to login or attempt refresh.
_Fix:_ Add a 401 interceptor in `src/lib/api.ts` that calls `clearAuth()` and redirects to `/auth/login`.

**BUG-004: No validated environment variables**
`process.env.NEXT_PUBLIC_API_URL` and `process.env.NEXT_PUBLIC_SOCKET_URL` are referenced directly with `|| 'http://localhost:5000'` fallbacks. If these are missing in production, the app silently hits localhost.
_Fix:_ Add `src/lib/env.ts` with Zod validation. Build fails if required vars are missing.

**BUG-005: Inconsistent API base URL**
Some fetch calls in `dashboard/page.tsx` use `/api/...` (relative URL, would hit Next.js routes, not Express — these would 404 in production), while `services/api.ts` uses `NEXT_PUBLIC_API_URL`. Mixed patterns cause silent production failures.
_Fix:_ All API calls must go through the centralized Axios instance in `src/lib/api.ts`.

**BUG-006: Socket.IO client created on every Chat render**
`io()` is called inside the `Chat` component's body. This creates a new socket connection every time the component mounts, and potentially multiple connections if the component re-renders. Socket is cleaned up in `useEffect`, but there's a race condition window.
_Fix:_ Move Socket.IO client to `src/lib/socket.ts` as a singleton. Connect once on app init.

### 🟡 Moderate (degraded UX or data integrity risk)

**BUG-007: `any` types pervasive throughout**
`dashboard/page.tsx` uses `useState<any[]>` for events, artists, applications. All TanStack Query responses are untyped. This masks bugs and removes IDE assistance.
_Fix:_ Define `types/` directory with interfaces mirroring all Mongoose models. Apply to all hooks and components.

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

**BUG-016: `EditEventForm` and `CreateEventForm` are separate components with duplicated logic**
Both forms have the same field definitions, the same validation, the same genre fetching. Any field change has to be made in two places.
_Fix:_ Merge into a single `EventForm` accepting a `mode: 'create' | 'edit'` and optional `initialData` prop.

**BUG-017: Application withdrawal not implemented**
An artist cannot cancel or withdraw a pending application. The Express controller has no `DELETE /applications/:id` endpoint from the artist's side.
_Fix:_ Add `DELETE /applications/:id` to Express + `useWithdrawApplication` hook in web/.

**BUG-018: No accessibility on icon-only buttons**
Multiple icon-only buttons (notification bell, chat menu, reaction picker toggle) have no `aria-label`. Screen readers cannot navigate the app.
_Fix:_ Add `aria-label` to all icon-only interactive elements.

### 🟢 Minor (polish, clean-up, nice-to-have)

**BUG-019: File naming is inconsistently PascalCase** — `LoginForm.tsx`, `EventCard.tsx` (should be `login-form.tsx`, `event-card.tsx` per Next.js convention).

**BUG-020: `ui/Navbar.tsx` and `ui/Footer.tsx` are in `components/ui/`** — the `ui/` directory is reserved for shadcn auto-generated components. Custom layout components belong in `components/layout/`.

**BUG-021: Chat component is 800+ lines** — `components/common/Chat.tsx` handles conversations list, message thread, socket management, emoji picker, and file upload all in one component. Should be split into `ConversationList`, `MessageThread`, `MessageInput`, and a `useSocket` hook.

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

### Phase 3 — Server Actions & Data Layer (next up)
**Goal:** Replace all TanStack Query hooks + Axios calls with Server Actions and Server Components. Re-enable data fetching. Zero `any` types.

Files to **create:**
- `src/app/(app)/dashboard/loading.tsx`
- `src/app/(app)/events/loading.tsx`, `error.tsx`
- `src/app/(app)/events/[id]/loading.tsx`, `error.tsx`
- `src/app/(app)/artists/loading.tsx`, `error.tsx`
- `src/app/(app)/artists/[id]/loading.tsx`, `error.tsx`
- `src/components/shared/empty-state.tsx`
- `src/components/shared/confirm-dialog.tsx`
- Skeleton UI components for EventCard, ArtistCard (loading variants)

Files to **modify:**
- `components/events/EventCard.tsx` — Add skeleton loading variant
- `components/artists/ArtistCard.tsx` — Add skeleton loading variant
- All browse pages — Use `empty-state.tsx` for zero-results

**Commits:** `feat: add loading and error boundaries to all routes`, `feat: add empty state components`

---

### Phase 4 — Events & Artist Profile Completeness
**Goal:** Merge duplicate forms; wire delete; wire file uploads end-to-end; ensure all fields display correctly.
**Product Vision link:** Core loop for both personas — things must work flawlessly.

Files to **create:**
- `src/components/events/EventForm.tsx` — Merged create/edit form
- `src/components/shared/image-upload.tsx` — Reusable image upload with preview + compression
- `src/components/shared/genre-selector.tsx` — Extracted genre multi-select

Files to **modify:**
- `app/events/create/page.tsx`, `app/events/edit/[id]/page.tsx` — Use merged `EventForm`
- `components/profile/CreateArtistProfile.tsx`, `EditArtistProfile.tsx` — Merge into `ArtistProfileForm`
- `services/events.ts` — Add `deleteEvent()` function
- `app/events/[id]/page.tsx` — Wire delete button with `confirm-dialog.tsx`

**Commits:** `refactor: merge duplicate event forms`, `feat: wire event delete with confirmation`, `feat: unified image upload component`

---

### Phase 5 — Applications Completeness
**Goal:** Full apply → review → accept/reject → withdraw loop.
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

### Phase 5 — Applications (Server Actions + Prisma)
**Goal:** Full apply → review → accept/reject → withdraw loop via Server Actions.

---

### Phase 6 — Real-time via Ably
**Goal:** Replace Socket.IO with Ably. Decompose the 800-line Chat component. Live messaging + notification push.

Files to **create:**
- `src/lib/ably.ts` — Server-side Ably client
- `src/app/api/ably-auth/route.ts` — Token auth endpoint for Ably client SDK
- `src/hooks/use-ably.ts` — Custom channel subscription hook
- `src/components/chat/conversation-list.tsx` — Extracted from Chat.tsx
- `src/components/chat/message-thread.tsx` — Extracted from Chat.tsx
- `src/components/chat/message-input.tsx` — Extracted from Chat.tsx

Files to **delete:**
- `src/components/common/Chat.tsx` — Decomposed into above

**Commits:** `feat: replace Socket.IO with Ably for real-time`, `refactor: decompose Chat into focused components`

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

### Legacy (remove after Phase 4)

| Variable | Description |
|---|---|
| `NEXT_PUBLIC_API_URL` | Express API URL (e.g. `http://localhost:5000`) |
| `NEXT_PUBLIC_SOCKET_URL` | Socket.IO server URL |

## Appendix: How to Run Everything Locally

### Target stack (after Phase 1+)
```bash
cd web
npm install
npx prisma generate
npx prisma db push     # or: npx prisma migrate dev
npx prisma db seed     # seeds genres
# create .env.local with all required vars (see .env.example)
npm run dev            # runs on http://localhost:3000
```

### During migration (Phases 0–3) — Express still needed
```bash
# Terminal 1: Express backend
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

### Target (post-Phase 4)

| Service | Platform | Notes |
|---|---|---|
| Next.js App (full-stack) | **Vercel** (free Hobby) | Server Components + Server Actions + Route Handlers |
| PostgreSQL | **Neon** (free tier) | Serverless, auto-scales, generous free tier |
| Images | **Cloudinary** (free tier) | 25GB storage, 25GB bandwidth/month |
| Real-time | **Ably** (free tier) | 6M messages/month |

### During migration (Phases 0–3)

| Service | Platform | Notes |
|---|---|---|
| Express API + Socket.IO | **Render** (free Web Service) | Kept running as safety net |
| MongoDB | **MongoDB Atlas** (free M0) | Used by Express backend |
| Next.js Frontend | **Vercel** | Proxies to Render for API calls |
| Images | **Cloudinary** | Used by Express for uploads |
