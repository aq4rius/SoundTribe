/**
 * Prisma seed script — populates the Genre table.
 *
 * Uses upsert to be idempotent (safe to run multiple times).
 * Genre list matches exactly: server/src/scripts/populateGenres.ts
 *
 * Usage:
 *   npx prisma db seed
 */

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const genres = [
  'Rock',
  'Pop',
  'Hip Hop',
  'Jazz',
  'Classical',
  'Electronic',
  'R&B',
  'Country',
  'Blues',
  'Reggae',
  'Folk',
  'Metal',
  'Punk',
  'Funk',
  'Soul',
];

async function main() {
  console.log('Seeding genres...\n');

  for (const name of genres) {
    await prisma.genre.upsert({
      where: { name },
      update: {},
      create: { name },
    });
    console.log(`  ✓ Seeded genre: ${name}`);
  }

  console.log(`\nDone — ${genres.length} genres seeded.`);
}

main()
  .catch((error) => {
    console.error('Seed failed:', error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
