import { Types } from 'mongoose';
import { IEventPosting } from '../models/Event';
import { IUser } from '../models/User';

export function isPopulatedEventPosting(event: Types.ObjectId | IEventPosting): event is IEventPosting {
  return (event as IEventPosting).postedBy !== undefined;
}

export function isPopulatedUser(user: Types.ObjectId | IUser): user is IUser {
  return (user as IUser).email !== undefined;
}