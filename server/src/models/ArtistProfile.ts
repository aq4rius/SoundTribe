// server/src/models/ArtistProfile.ts

import mongoose, { Document, Schema, Types } from 'mongoose';
import { IUser } from './User';
import { IGenre } from './Genre';

export interface IArtistProfile extends Document {
  user: Types.ObjectId | IUser;
  stageName: string;
  biography?: string;
  genres: Array<Types.ObjectId | IGenre>;
  instruments: string[];
  yearsOfExperience: number;
  location: string;
  websiteUrl?: string;
  socialMediaLinks?: {
    facebook?: string;
    instagram?: string;
    twitter?: string;
    youtube?: string;
  };
  profileImage?: string;
  portfolioItems?: Array<{
    title: string;
    description: string;
    mediaUrl: string;
    mediaType: 'audio' | 'video' | 'image';
  }>;
  availability: {
    isAvailable: boolean;
    availableDates?: Date[];
  };
  ratePerHour?: number;
  createdAt: Date;
  updatedAt: Date;
}

const ArtistProfileSchema: Schema = new Schema({
  user: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  stageName: { type: String, required: true },
  biography: { type: String },
  genres: [{ type: Schema.Types.ObjectId, ref: 'Genre' }],
  instruments: [{ type: String }],
  yearsOfExperience: { type: Number, required: true },
  location: { type: String, required: true },
  websiteUrl: { type: String },
  socialMediaLinks: {
    facebook: { type: String },
    instagram: { type: String },
    twitter: { type: String },
    youtube: { type: String },
  },
  profileImage: { type: String },
  portfolioItems: [{
    title: { type: String, required: true },
    description: { type: String },
    mediaUrl: { type: String, required: true },
    mediaType: { type: String, enum: ['audio', 'video', 'image'], required: true },
  }],
  availability: {
    isAvailable: { type: Boolean, default: true },
    availableDates: [{ type: Date }],
  },
  ratePerHour: { type: Number },
}, { timestamps: true });

const ArtistProfile = mongoose.model<IArtistProfile>('ArtistProfile', ArtistProfileSchema);

export default ArtistProfile;