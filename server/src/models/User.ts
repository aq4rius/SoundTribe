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
  username: string;
  email: string;
  password: string;
  role: UserRole;
  profileCompleted: boolean;
  firstName?: string;
  lastName?: string;
  location?: string;
  bio?: string;
  preferences?: {
    genres: Types.ObjectId[];
    notificationSettings: {
      email: boolean;
      push: boolean;
    };
  };
  comparePassword: (candidatePassword: string) => Promise<boolean>;
}

const UserSchema: Schema = new Schema({
  username: { type: String, required: true, unique: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  role: { type: String, enum: Object.values(UserRole), default: UserRole.USER },
  profileCompleted: { type: Boolean, default: false },
  firstName: { type: String },
  lastName: { type: String },
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