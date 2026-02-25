# Legacy Code Archive

This directory contains the **original Express + React** stack that was replaced
during Phase 4 of the SoundTribe migration.

## Contents

| Folder     | Description                                          |
|------------|------------------------------------------------------|
| `server/`  | Express API server (Node/TypeScript, MongoDB)        |
| `client/`  | Vite + React SPA (TypeScript, Tailwind)              |

## Why archived?

The application has been fully migrated to **Next.js 15** (App Router) with:

- **Prisma + PostgreSQL (Neon)** instead of Mongoose + MongoDB
- **NextAuth v5** instead of custom JWT
- **Server Actions** instead of REST API routes
- **Ably** instead of Socket.IO for real-time messaging & notifications

These directories are kept for historical reference only.  
**Do not deploy or run any code from this folder.**

## Render (previous hosting)

The Express server was deployed to Render. That service should now be cancelled
since all endpoints are served by the Next.js app on Vercel.
