// server/src/models/Genre.ts

import mongoose, { Document, Schema } from 'mongoose';

export interface IGenre extends Document {
  name: string;
  description?: string;
}

const GenreSchema: Schema = new Schema({
  name: { type: String, required: true, unique: true },
  description: { type: String }
});

const Genre = mongoose.model<IGenre>('Genre', GenreSchema);

export default Genre;