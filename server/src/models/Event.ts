import mongoose, { Document, Schema, Types } from 'mongoose';
import { IUser } from './User';
import { IGenre } from './Genre';

export interface IEventPosting extends Document {
  postedBy: Types.ObjectId | IUser;
  title: string;
  description: string;
  genres: Array<Types.ObjectId | IGenre>;
  requiredInstruments: string[];
  location: string;
  eventDate: Date;
  duration: number; // in hours
  paymentAmount: number;
  paymentType: 'fixed' | 'hourly';
  requiredExperience: number; // in years
  applicationDeadline: Date;
  status: 'open' | 'closed' | 'filled';
  createdAt: Date;
  updatedAt: Date;
}

const EventPostingSchema: Schema = new Schema({
  postedBy: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  title: { type: String, required: true },
  description: { type: String, required: true },
  genres: [{ type: Schema.Types.ObjectId, ref: 'Genre', required: true }],
  requiredInstruments: [{ type: String, required: true }],
  location: { type: String, required: true },
  eventDate: { type: Date, required: true },
  duration: { type: Number, required: true },
  paymentAmount: { type: Number, required: true },
  paymentType: { type: String, enum: ['fixed', 'hourly'], required: true },
  requiredExperience: { type: Number, default: 0 },
  applicationDeadline: { type: Date, required: true },
  status: { type: String, enum: ['open', 'closed', 'filled'], default: 'open' },
}, { timestamps: true });

const EventPosting = mongoose.model<IEventPosting>('EventPosting', EventPostingSchema);

export default EventPosting;