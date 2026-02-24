# Neon PostgreSQL Setup Guide

This guide walks you through setting up the Neon PostgreSQL database for SoundTribe.

---

## 1. Create a Neon Account

1. Go to [neon.tech](https://neon.tech) and sign up (GitHub SSO recommended).
2. Verify your email if prompted.

## 2. Create a Project

1. Click **"New Project"** in the Neon dashboard.
2. **Project name:** `soundtribe`
3. **Region:** Choose the closest region to your deployment target (e.g., `eu-central-1` for Europe, `us-east-1` for US).
4. **PostgreSQL version:** Use the latest available (16+).
5. Click **"Create Project"**.

## 3. Get Connection Strings

After creating the project, Neon shows you two connection strings. You need **both**.

### Pooled Connection String (for the app / Vercel serverless)

This goes through Neon's connection pooler (pgBouncer) and is **required** for serverless
environments like Vercel where connections are short-lived.

```
postgresql://<user>:<password>@<endpoint-id>-pooler.region.aws.neon.tech/soundtribe?sslmode=require
```

> **Important:** The URL contains `-pooler` in the hostname. This is the pooled endpoint.

### Direct Connection String (for Prisma Migrate)

Prisma Migrate needs a direct (non-pooled) connection to run DDL statements and manage
the `_prisma_migrations` table:

```
postgresql://<user>:<password>@<endpoint-id>.region.aws.neon.tech/soundtribe?sslmode=require
```

> **Important:** This URL does **not** contain `-pooler`. Used only for `prisma migrate`.

## 4. Configure Environment Variables

Add both connection strings to `web/.env.local`:

```env
# Pooled connection — used by the app at runtime (PrismaClient queries)
DATABASE_URL="postgresql://<user>:<password>@<endpoint-id>-pooler.region.aws.neon.tech/soundtribe?sslmode=require"

# Direct connection — used only by Prisma Migrate
DIRECT_URL="postgresql://<user>:<password>@<endpoint-id>.region.aws.neon.tech/soundtribe?sslmode=require"
```

> Replace `<user>`, `<password>`, and `<endpoint-id>` with values from the Neon dashboard.

## 5. Apply the Schema

Run the following from the `web/` directory:

```bash
# Option A: Apply schema using migrate (creates migration history)
cd web && npx prisma migrate dev --name init

# Option B: Push schema without migration history (quicker for dev)
cd web && npx prisma db push
```

## 6. Seed the Database

After the schema is applied:

```bash
cd web && npx prisma db seed
```

This seeds the 15 genre records. The seed script is idempotent (safe to run multiple times).

## 7. Verify in Neon Console

1. Go to the Neon dashboard → your project → **SQL Editor**.
2. Run:

```sql
SELECT table_name FROM information_schema.tables WHERE table_schema = 'public';
```

You should see these tables:
- `users`
- `artist_profiles`
- `event_postings`
- `applications`
- `conversations`
- `messages`
- `notifications`
- `genres`
- `_ArtistProfileGenres` (implicit many-to-many join table)
- `_EventPostingGenres` (implicit many-to-many join table)
- `_EventLineup` (implicit many-to-many join table)
- `_prisma_migrations`

3. Verify genres were seeded:

```sql
SELECT * FROM genres ORDER BY name;
```

## Troubleshooting

| Symptom | Fix |
|---|---|
| `P1001: Can't reach database server` | Check that `sslmode=require` is in the URL |
| `prepared statement already exists` | You're using the direct URL at runtime — switch to the pooled URL |
| `prisma migrate` hangs | Use `DIRECT_URL` (non-pooled) for migrations |
| `P2002: Unique constraint failed on genres` | Seed script uses upsert — this shouldn't happen, but re-run is safe |
