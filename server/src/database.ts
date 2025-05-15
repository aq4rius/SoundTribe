// server/src/database.ts

import mongoose from 'mongoose';

export async function connectToDatabase(uri: string): Promise<void> {
  try {
    await mongoose.connect(uri);
    console.log('Connected to the database');
  } catch (error) {
    console.error('Database connection error:', error);
    throw error;
  }
}
