# SoundTribe — Environment Variables

All environment variables are validated at startup by `src/lib/env.ts` using Zod. The application will throw a clear error if any required variable is missing or malformed.

---

## Required Variables

| Variable | Description | Example | Source |
|---|---|---|---|
| `DATABASE_URL` | PostgreSQL connection string | `postgresql://user:pass@host/db?sslmode=require` | [Neon](https://neon.tech) dashboard |
| `AUTH_SECRET` | NextAuth session encryption key (min 32 chars) | `openssl rand -base64 32` | Generate locally |
| `NEXTAUTH_URL` | Full application URL | `http://localhost:3000` (dev) / `https://soundtribe.vercel.app` (prod) | Your deployment URL |
| `CLOUDINARY_CLOUD_NAME` | Cloudinary cloud name | `soundtribe` | [Cloudinary](https://cloudinary.com) dashboard |
| `CLOUDINARY_API_KEY` | Cloudinary API key | `123456789012345` | Cloudinary dashboard |
| `CLOUDINARY_API_SECRET` | Cloudinary API secret | `abcdef...` | Cloudinary dashboard |
| `ABLY_API_KEY` | Server-side Ably API key (full capabilities) | `xxxxx.yyyy:zzzzzz` | [Ably](https://ably.com) app → API Keys |
| `NEXT_PUBLIC_ABLY_KEY` | Client-side Ably key (subscribe only) | `xxxxx.yyyy:zzzzzz` | Ably app → API Keys |

---

## Local Development Setup

1. Copy the example env file:
   ```bash
   cd web
   cp .env.example .env.local
   ```

2. Fill in all values in `.env.local`

3. For local development, set:
   ```
   NEXTAUTH_URL=http://localhost:3000
   ```

> **Note:** `.env.local` is gitignored and should never be committed.

---

## Environment File Precedence

Next.js loads environment files in this order (later overrides earlier):

1. `.env` — Base defaults (committed)
2. `.env.local` — Local overrides (gitignored)
3. `.env.development` / `.env.production` — Mode-specific
4. `.env.development.local` / `.env.production.local` — Mode-specific local

For SoundTribe, use `.env.local` for all secrets during development.

---

## Production (Vercel)

Set all 8 variables in **Vercel → Project → Settings → Environment Variables**.

For CI/CD via GitHub Actions, also add these as GitHub repository secrets:

| Secret | Purpose |
|---|---|
| `VERCEL_TOKEN` | Vercel deployment authentication |
| `VERCEL_ORG_ID` | Vercel organization ID |
| `VERCEL_PROJECT_ID` | Vercel project ID |

See [DEPLOYMENT.md](DEPLOYMENT.md) for the full deployment setup guide.

---

## Validation

The Zod schema in `src/lib/env.ts` validates all variables at import time. If any are missing, you'll see an error like:

```
❌ Invalid environment variables:
  DATABASE_URL: Required
  AUTH_SECRET: Required
```

This prevents the app from starting with misconfigured secrets.

---

## Security Notes

- **Never commit** `.env.local` or any file containing secrets
- **`NEXT_PUBLIC_` prefix** makes a variable available in the browser — only `NEXT_PUBLIC_ABLY_KEY` should use this prefix
- **`AUTH_SECRET`** must be at least 32 characters for cryptographic security
- **Rotate secrets** immediately if they are accidentally exposed in version control
- **`ABLY_API_KEY`** (server-side) has full publish/subscribe capabilities — never expose it to the client
