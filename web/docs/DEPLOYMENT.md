# SoundTribe — Deployment Guide

Step-by-step guide to deploy SoundTribe to production.

---

## Prerequisites

- GitHub repository with the SoundTribe code
- Accounts on: [Vercel](https://vercel.com), [Neon](https://neon.tech), [Cloudinary](https://cloudinary.com), [Ably](https://ably.com)

---

## 1. Neon (PostgreSQL Database)

1. Create a Neon account at [neon.tech](https://neon.tech)
2. Create a new project (e.g., `soundtribe-prod`)
3. Copy the connection string — this is your `DATABASE_URL`
   - Format: `postgresql://user:password@host/dbname?sslmode=require`
4. Run migrations against the production database:
   ```bash
   DATABASE_URL="your-prod-connection-string" npx prisma migrate deploy
   ```
5. Seed genres (one-time):
   ```bash
   DATABASE_URL="your-prod-connection-string" npx prisma db seed
   ```

See [NEON_SETUP.md](NEON_SETUP.md) for detailed Neon configuration.

---

## 2. Cloudinary (File Uploads)

1. Create a Cloudinary account at [cloudinary.com](https://cloudinary.com)
2. Go to **Dashboard** → note your:
   - **Cloud Name** → `CLOUDINARY_CLOUD_NAME`
   - **API Key** → `CLOUDINARY_API_KEY`
   - **API Secret** → `CLOUDINARY_API_SECRET`
3. (Optional) Create an upload preset for unsigned uploads

---

## 3. Ably (Real-time Messaging)

1. Create an Ably account at [ably.com](https://ably.com)
2. Create a new app (e.g., `soundtribe-prod`)
3. Go to the app's **API Keys** tab
4. Copy the **Root API Key** → `ABLY_API_KEY` (server-side)
5. Create a client-side key with limited capabilities:
   - Subscribe only on `conversation:*`, `notifications:*`, `presence:*`
   - This is your `NEXT_PUBLIC_ABLY_KEY`

---

## 4. AUTH_SECRET

Generate a random 32+ character secret for NextAuth:

```bash
openssl rand -base64 32
```

This becomes your `AUTH_SECRET` environment variable.

---

## 5. Vercel (Hosting)

### Initial Setup

1. Go to [vercel.com](https://vercel.com) → **New Project**
2. Import your GitHub repository
3. Set:
   - **Framework Preset:** Next.js
   - **Root Directory:** `web`
   - **Build Command:** `prisma generate && next build`
   - **Install Command:** `npm install`
4. Add all environment variables (see [ENVIRONMENT.md](ENVIRONMENT.md)):
   - `DATABASE_URL`
   - `AUTH_SECRET`
   - `NEXTAUTH_URL` (your production URL, e.g., `https://soundtribe.vercel.app`)
   - `CLOUDINARY_CLOUD_NAME`
   - `CLOUDINARY_API_KEY`
   - `CLOUDINARY_API_SECRET`
   - `ABLY_API_KEY`
   - `NEXT_PUBLIC_ABLY_KEY`
5. Click **Deploy**

### Vercel Project IDs (for CI/CD)

After the first deploy, retrieve these for GitHub Actions:

1. Install Vercel CLI: `npm install -g vercel`
2. Run `vercel link` in the `web/` directory
3. Check `.vercel/project.json` for:
   - `projectId` → `VERCEL_PROJECT_ID`
   - `orgId` → `VERCEL_ORG_ID`
4. Generate a Vercel token at [vercel.com/account/tokens](https://vercel.com/account/tokens) → `VERCEL_TOKEN`

---

## 6. GitHub Secrets (for CI/CD)

Add these secrets in **GitHub → Repository → Settings → Secrets and variables → Actions**:

### Application Secrets (used by CI build job)

| Secret | Source |
|---|---|
| `DATABASE_URL` | Neon connection string |
| `AUTH_SECRET` | Generated with `openssl rand -base64 32` |
| `NEXTAUTH_URL` | Your production URL |
| `CLOUDINARY_CLOUD_NAME` | Cloudinary dashboard |
| `CLOUDINARY_API_KEY` | Cloudinary dashboard |
| `CLOUDINARY_API_SECRET` | Cloudinary dashboard |
| `ABLY_API_KEY` | Ably app API keys |
| `NEXT_PUBLIC_ABLY_KEY` | Ably app API keys (client) |

### Vercel Deployment Secrets (used by deploy workflow)

| Secret | Source |
|---|---|
| `VERCEL_TOKEN` | Vercel account tokens page |
| `VERCEL_ORG_ID` | `.vercel/project.json` after `vercel link` |
| `VERCEL_PROJECT_ID` | `.vercel/project.json` after `vercel link` |

---

## 7. First Deploy Checklist

After the initial deploy, verify:

- [ ] App loads at your Vercel URL
- [ ] Login / register flow works
- [ ] Onboarding completes successfully
- [ ] Events page loads with seeded data (or empty state)
- [ ] Artists page loads
- [ ] Real-time notifications arrive (create an application to test)
- [ ] Chat messages send and receive in real-time

---

## 8. Database Seeding (Production)

Seed the genre list on first deploy:

```bash
cd web
DATABASE_URL="your-prod-connection-string" npx prisma db seed
```

This inserts 15 genres: Rock, Pop, Hip Hop, Jazz, Classical, Country, R&B, Electronic, Folk, Blues, Metal, Reggae, Latin, Soul, Punk.

---

## 9. Smoke Test

After deployment, run through the core loop:

1. **Register** a new user → complete onboarding
2. **Create an artist profile** → verify it appears on /artists
3. **Create an event** → verify it appears on /events
4. **Apply to the event** from the artist account
5. **Accept the application** from the organizer account
6. **Send a message** — verify real-time delivery
7. **Check notifications** — verify notification bell updates

---

## CI/CD Pipelines

Two GitHub Actions workflows are configured:

### CI (`.github/workflows/ci.yml`)

Runs on every push to `main` and every PR:
1. **Type Check** — `tsc --noEmit`
2. **Lint** — `next lint`
3. **Unit Tests** — `vitest --run`
4. **Build** — `next build` (runs after the above three pass)

### Deploy (`.github/workflows/deploy.yml`)

Runs on push to `main`:
1. Generates Prisma client
2. Runs `prisma migrate deploy`
3. Builds and deploys to Vercel via CLI

---

## Troubleshooting

### Build fails with Prisma errors
Ensure your Vercel build command includes `prisma generate`:
```
prisma generate && next build
```

### Auth not working in production
- Verify `NEXTAUTH_URL` matches your exact production URL (including `https://`)
- Verify `AUTH_SECRET` is set and at least 32 characters

### Real-time not working
- Check Ably dashboard for connection errors
- Verify `NEXT_PUBLIC_ABLY_KEY` has subscribe capabilities on the required channels
- Verify `ABLY_API_KEY` has publish capabilities

### Database connection issues
- Neon free tier connections may pool/timeout — ensure your `DATABASE_URL` includes `?sslmode=require`
- Check Neon dashboard for connection limits
