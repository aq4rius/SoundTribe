# SoundTribe

The platform where the music industry organizes itself — connecting event organizers with artists across every genre, every instrument, every stage size.

## Quick Start

All source code lives in [`web/`](web/). See [`web/README.md`](web/README.md) for setup instructions, architecture overview, and development guide.

## Repository Structure

```
.github/          # CI/CD workflows, PR template, commit conventions
web/              # Next.js 15 application (the entire product)
  ├── prisma/     # Database schema & migrations
  ├── src/        # Application source code
  ├── e2e/        # Playwright end-to-end tests
  └── docs/       # Deployment & environment docs
```

## Documentation

- [**README**](web/README.md) — Tech stack, dev setup, scripts, folder structure
- [**Architecture**](web/ARCHITECTURE.md) — Technical decisions, migration history, roadmap
- [**Product Vision**](web/docs/PRODUCT_VISION.md) — Mission, personas, feature scope, monetization
- [**Deployment**](web/docs/DEPLOYMENT.md) — Production deployment guide
- [**Environment**](web/docs/ENVIRONMENT.md) — Environment variables reference
