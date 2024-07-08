import { Types } from 'mongoose';
import { IJobPosting } from '../models/JobPosting';
import { IUser } from '../models/User';

export function isPopulatedJobPosting(job: Types.ObjectId | IJobPosting): job is IJobPosting {
  return (job as IJobPosting).postedBy !== undefined;
}

export function isPopulatedUser(user: Types.ObjectId | IUser): user is IUser {
  return (user as IUser).email !== undefined;
}