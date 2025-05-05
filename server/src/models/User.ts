// server/src/models/User.ts

import mongoose, { Types, Document, Schema } from 'mongoose';
import bcrypt from 'bcrypt';

export enum UserRole {
  USER = 'user',
  ARTIST = 'artist',
  ADMIN = 'admin'
}

export interface IUser extends Document {
  _id: Types.ObjectId;
  username: string;
  email: string;
  password: string;
  role: UserRole;
  basicProfileCompleted: boolean;
  artistProfileCompleted: boolean;
  profileCompleted: boolean;
  firstName?: string;
  lastName?: string;
  location?: string;
  bio?: string;
  favoriteGenres?: Types.ObjectId[];
  preferredContentTypes?: string[];
  notificationPreferences?: {
    email: boolean;
    push: boolean;
  };
  privacySettings?: {
    showEmail: boolean;
    showLocation: boolean;
  };
  comparePassword: (candidatePassword: string) => Promise<boolean>;
}

const UserSchema: Schema = new Schema({
  username: { type: String, required: true, unique: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  role: { type: String, enum: Object.values(UserRole), default: UserRole.USER },
  basicProfileCompleted: { type: Boolean, default: false },
  artistProfileCompleted: { type: Boolean, default: false },
  profileCompleted: { type: Boolean, default: false },
  firstName: { type: String },
  lastName: { type: String },
  location: { type: String },
  bio: { type: String },
  favoriteGenres: [{ type: Schema.Types.ObjectId, ref: 'Genre' }],
  preferredContentTypes: [{ type: String }],
  notificationPreferences: {
    email: { type: Boolean, default: true },
    push: { type: Boolean, default: true }
  },
  privacySettings: {
    showEmail: { type: Boolean, default: false },
    showLocation: { type: Boolean, default: true }
  }
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