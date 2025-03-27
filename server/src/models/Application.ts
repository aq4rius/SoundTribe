// server/src/models/Application.ts

import mongoose, { Document, Schema, Types } from 'mongoose';
import { IUser } from './User';
import { IArtistProfile } from './ArtistProfile';
import { IEventPosting } from './Event';

export interface IApplication extends Document {
  applicant: Types.ObjectId | IUser;
  artistProfile: Types.ObjectId | IArtistProfile;
  eventPosting: Types.ObjectId | IEventPosting;
  coverLetter: string;
  status: 'pending' | 'accepted' | 'rejected';
  proposedRate?: number;
  availability: Date[];
  createdAt: Date;
  updatedAt: Date;
}

const ApplicationSchema: Schema = new Schema({
  applicant: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  artistProfile: { type: Schema.Types.ObjectId, ref: 'ArtistProfile', required: true },
  eventPosting: { type: Schema.Types.ObjectId, ref: 'EventPosting', required: true },
  coverLetter: { type: String, required: true },
  status: { type: String, enum: ['pending', 'accepted', 'rejected'], default: 'pending' },
  proposedRate: { type: Number },
  availability: [{ type: Date }],
}, { timestamps: true });

const Application = mongoose.model<IApplication>('Application', ApplicationSchema);

export default Application;