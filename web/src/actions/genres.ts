'use server';

import { unstable_cache } from 'next/cache';
import { db } from '@/lib/db';

export const getGenres = unstable_cache(
  async () => {
    return db.genre.findMany({ orderBy: { name: 'asc' } });
  },
  ['genres'],
  { revalidate: 86400, tags: ['genres'] },
);
