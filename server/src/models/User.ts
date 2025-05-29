// server/src/models/User.ts

import mongoose, { Types, Document, Schema } from 'mongoose';
import bcrypt from 'bcrypt';

export enum UserRole {
  USER = 'user',
  ARTIST = 'artist',
  ADMIN = 'admin',
}

export interface IUser extends Document {
  _id: Types.ObjectId;
  username: string;
  email: string;
  password: string;
  firstName?: string;
  lastName?: string;
  location?: string;
  bio?: string;
  roles: UserRole[];
  onboardingStep: number;
  onboardingComplete: boolean;
  preferences: {
    genres?: string[];
    instruments?: string[];
    influences?: string[];
    eventTypes?: string[];
    skills?: string[];
  };
  locationDetails?: {
    city?: string;
    region?: string;
    willingToTravel?: number; // in km
  };
  notificationPreferences?: {
    email: boolean;
    push: boolean;
  };
  privacySettings?: {
    showEmail: boolean;
    showLocation: boolean;
  };
  emailVerified?: boolean;
  resetPasswordToken?: string;
  resetPasswordExpires?: Date;
  emailVerificationToken?: string;
  emailVerificationExpires?: Date;
  comparePassword: (candidatePassword: string) => Promise<boolean>;
}

const UserSchema: Schema = new Schema({
  username: { type: String, required: true, unique: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  firstName: { type: String },
  lastName: { type: String },
  location: { type: String },
  bio: { type: String },
  roles: { type: [String], default: [UserRole.USER] },
  onboardingStep: { type: Number, default: 0 },
  onboardingComplete: { type: Boolean, default: false },
  preferences: {
    genres: [{ type: String }], // Accept genre names as strings
    instruments: [{ type: String }],
    influences: [{ type: String }],
    eventTypes: [{ type: String }],
    skills: [{ type: String }],
  },
  locationDetails: {
    city: { type: String },
    region: { type: String },
    willingToTravel: { type: Number }, // in km
  },
  notificationPreferences: {
    email: { type: Boolean, default: true },
    push: { type: Boolean, default: true },
  },
  privacySettings: {
    showEmail: { type: Boolean, default: false },
    showLocation: { type: Boolean, default: true },
  },
  emailVerified: { type: Boolean, default: false },
  resetPasswordToken: { type: String },
  resetPasswordExpires: { type: Date },
  emailVerificationToken: { type: String },
  emailVerificationExpires: { type: Date },
});

UserSchema.pre<IUser>('save', async function (next) {
  if (!this.isModified('password')) return next();
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

UserSchema.methods.comparePassword = async function (candidatePassword: string): Promise<boolean> {
  return bcrypt.compare(candidatePassword, this.password);
};

const User = mongoose.model<IUser>('User', UserSchema);

export default User;
