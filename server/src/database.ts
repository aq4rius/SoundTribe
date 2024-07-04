import mongoose from 'mongoose';

export async function connectToDatabase(uri: string): Promise<void> {
  try {
    await mongoose.connect(uri);
    console.log('Connected to the database');
  } catch (error) {
    console.error('Database connection error:', error);
    // Rethrow the error to be handled by the caller
    throw error;
  }
}