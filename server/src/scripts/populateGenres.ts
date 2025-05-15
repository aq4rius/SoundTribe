// server/src/scripts/populateGenres.ts

import * as dotenv from 'dotenv';
import * as path from 'path';
import mongoose from 'mongoose';
import Genre from '../models/Genre';
import { connectToDatabase } from '../database';

dotenv.config({ path: path.resolve(__dirname, '../../.env') });

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

async function populateGenres() {
  await connectToDatabase(process.env.MONGODB_URI!);

  for (const genreName of genres) {
    await Genre.findOneAndUpdate({ name: genreName }, { name: genreName }, { upsert: true });
  }

  mongoose.connection.close();
}

populateGenres().catch(console.error);
