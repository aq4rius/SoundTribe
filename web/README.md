# SoundTribe — Web Application

The platform where the music industry organizes itself. SoundTribe connects event organizers who need talent with artists who want to perform — removing friction, opacity, and middlemen from the live music scene.

## Tech Stack

| Layer | Technology |
|---|---|
| **Framework** | Next.js 15.3 (App Router, Turbopack) |
| **Language** | TypeScript 5 (strict mode) |
| **Auth** | NextAuth v5 (httpOnly cookie JWT sessions) |
| **Database** | PostgreSQL via Prisma 6 (Neon serverless) |
| **Data Layer** | Server Actions (reads + mutations) |
| **Real-time** | Ably (messaging, notifications, typing indicators) |
| **File Uploads** | Cloudinary (chat attachments, profile images) |
| **UI** | shadcn/ui + Radix UI + Tailwind CSS v4 |
| **Forms** | React Hook Form + Zod |
| **Animations** | Framer Motion |
| **Component Dev** | Storybook 8 |
| **Unit Tests** | Vitest (58 tests) |
| **E2E Tests** | Playwright |
| **Hosting** | Vercel (app) + Neon (database) |

## Architecture

```
Browser
  └── Next.js 15 (fully self-contained)
        ├── NextAuth v5 (httpOnly cookie JWT sessions)
        ├── Prisma 6 → PostgreSQL (Neon)
        ├── Server Actions (all domains)
        ├── Route Handler: /api/ably-auth (token auth)
        ├── Middleware (route protection)
        ├── Cloudinary (image uploads)
        └── Ably (real-time messaging + notifications)
```

See [ARCHITECTURE.md](ARCHITECTURE.md) for detailed decisions and migration history.

## Getting Started

### Prerequisites

- Node.js 20+
- npm 10+
- A PostgreSQL database (recommend [Neon](https://neon.tech) free tier)

### Setup

```bash
cd web
npm install
cp .env.example .env.local   # Fill in all required values
npx prisma generate
npx prisma db push            # Or: npx prisma migrate dev
npx prisma db seed            # Seeds 15 genres
npm run dev                   # → http://localhost:3000
```

See [docs/ENVIRONMENT.md](docs/ENVIRONMENT.md) for all required environment variables.

## Scripts

| Command | Description |
|---|---|
| `npm run dev` | Start dev server with Turbopack |
| `npm run build` | Production build |
| `npm run start` | Start production server |
| `npm run lint` | ESLint check |
| `npm run type-check` | TypeScript type checking (`tsc --noEmit`) |
| `npm run test` | Run Vitest unit tests |
| `npm run storybook` | Start Storybook on port 6006 |
| `npm run build-storybook` | Build static Storybook |
| `npm run db:generate` | Regenerate Prisma client |
| `npm run db:push` | Push schema to database |
| `npm run db:migrate` | Run Prisma migrations |
| `npm run db:studio` | Open Prisma Studio |
| `npm run db:seed` | Seed genre data |

## Folder Structure

```
web/
├── prisma/
│   ├── schema.prisma          # Database schema (10 models)
│   ├── seed.ts                # Genre seed script
│   └── migrations/            # SQL migrations
├── e2e/                       # Playwright E2E tests
│   ├── auth.spec.ts           # Auth flow tests (5)
│   └── core-loop.spec.ts      # Core loop tests (7)
├── public/
│   └── icon.svg               # Branded favicon
├── src/
│   ├── middleware.ts           # NextAuth route protection
│   ├── actions/               # Server Actions (9 domain files)
│   │   ├── auth.ts            # Register, login, logout, password reset
│   │   ├── events.ts          # CRUD + search + my events
│   │   ├── artist-profiles.ts # CRUD + search
│   │   ├── applications.ts    # Apply, accept/reject, withdraw
│   │   ├── messages.ts        # Send, react, read, delete, conversations
│   │   ├── notifications.ts   # Get, mark read, delete, unread count
│   │   ├── networking.ts      # Connection requests
│   │   ├── users.ts           # Profile, settings, onboarding
│   │   ├── genres.ts          # Genre list (24h cache)
│   │   └── upload.ts          # Cloudinary upload
│   ├── app/
│   │   ├── (app)/             # Authenticated routes (dashboard, events, artists, chat)
│   │   ├── (auth)/            # Auth routes (login, register, password flows)
│   │   ├── api/ably-auth/     # Ably token auth endpoint
│   │   ├── layout.tsx         # Root layout (fonts, metadata, providers)
│   │   ├── globals.css        # Global styles
│   │   ├── error.tsx          # Global error boundary
│   │   ├── not-found.tsx      # 404 page
│   │   ├── robots.ts          # SEO robots rules
│   │   ├── sitemap.ts         # SEO sitemap
│   │   └── opengraph-image.tsx # OG image generation
│   ├── components/
│   │   ├── applications/      # ApplicationForm, ApplicationsList
│   │   ├── artists/           # ArtistCard
│   │   ├── auth/              # LoginForm, RegisterForm
│   │   ├── chat/              # 5 decomposed chat components
│   │   ├── common/            # ErrorAlert, Pagination, Providers
│   │   ├── events/            # EventForm, EventCard
│   │   ├── notifications/     # NotificationBell, NotificationDropdown
│   │   ├── onboarding/        # OnboardingStepper + 7 step components
│   │   ├── profile/           # Artist profile CRUD components
│   │   ├── shared/            # EmptyState, RouteError, Skeleton
│   │   └── ui/                # shadcn/ui auto-generated components
│   ├── hooks/
│   │   └── use-ably-channel.ts # Ably subscription + presence hooks
│   ├── lib/
│   │   ├── ably.ts            # Server-side Ably client
│   │   ├── action-utils.ts    # requireAuth(), hasRole(), withActionHandler()
│   │   ├── auth.ts            # NextAuth v5 config
│   │   ├── auth.config.ts     # Edge-compatible auth config
│   │   ├── cloudinary.ts      # Cloudinary client
│   │   ├── db.ts              # Prisma client singleton
│   │   ├── env.ts             # Zod-validated environment variables
│   │   └── utils.ts           # cn() utility
│   ├── types/                 # Prisma-derived TypeScript types
│   ├── validations/           # Zod schemas + unit tests
│   ├── stories/               # Storybook stories (8 components)
│   │   └── mock-data.ts       # Shared typed fixtures
│   └── test/
│       └── setup.ts           # Vitest setup
└── docs/
    ├── DEPLOYMENT.md          # Production deployment guide
    ├── ENVIRONMENT.md         # Environment variables reference
    ├── NEON_SETUP.md          # Neon database setup
    └── PRODUCT_VISION.md      # Product vision & strategy
```

## Testing

### Unit Tests (Vitest)

58 tests across 5 files covering validation schemas, action utilities, and helpers:

```bash
npm run test           # Watch mode
npm run test -- --run  # Single run (CI)
```

### Component Tests (Storybook)

8 story files covering core UI components:

```bash
npm run storybook       # Interactive development
npm run build-storybook # Static build
```

### E2E Tests (Playwright)

Auth flows and core loop coverage:

```bash
npx playwright test     # Run all E2E tests
npx playwright test --ui # Interactive mode
```

## Deployment

See [docs/DEPLOYMENT.md](docs/DEPLOYMENT.md) for the complete production deployment guide.

**Quick summary:** Deploy to [Vercel](https://vercel.com) with [Neon](https://neon.tech) PostgreSQL, [Cloudinary](https://cloudinary.com) for media, and [Ably](https://ably.com) for real-time. CI/CD via GitHub Actions (`.github/workflows/`).

## Documentation

| Document | Purpose |
|---|---|
| [ARCHITECTURE.md](ARCHITECTURE.md) | Technical decisions, migration phases, feature checklist, roadmap |
| [docs/PRODUCT_VISION.md](docs/PRODUCT_VISION.md) | Mission, personas, MVP scope, monetization strategy |
| [docs/DEPLOYMENT.md](docs/DEPLOYMENT.md) | Step-by-step production deployment |
| [docs/ENVIRONMENT.md](docs/ENVIRONMENT.md) | All environment variables documented |
| [docs/NEON_SETUP.md](docs/NEON_SETUP.md) | Neon PostgreSQL setup guide |
