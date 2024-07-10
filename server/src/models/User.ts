import mongoose, { Types, Document, Schema } from 'mongoose';
import bcrypt from 'bcrypt';

export enum UserRole {
  USER = 'user',
  ARTIST = 'artist',
  RECRUITER = 'recruiter',
  ADMIN = 'admin'
}

export interface IUser extends Document {
  _id: Types.ObjectId;
  email: string;
  password: string;
  role: UserRole;
  firstName: string;
  lastName: string;
  location: string;
  bio: string;
  preferences: {
    genres: Types.ObjectId[];
    notificationSettings: {
      email: boolean;
      push: boolean;
    };
  };
  comparePassword: (candidatePassword: string) => Promise<boolean>;
}

const UserSchema: Schema = new Schema({
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  role: { type: String, enum: Object.values(UserRole), default: UserRole.USER },
  firstName: { type: String, required: true },
  lastName: { type: String, required: true },
  location: { type: String },
  bio: { type: String },
  preferences: {
    genres: [{ type: Schema.Types.ObjectId, ref: 'Genre' }],
    notificationSettings: {
      email: { type: Boolean, default: true },
      push: { type: Boolean, default: true }
    }
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