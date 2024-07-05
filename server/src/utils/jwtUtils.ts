import jwt from 'jsonwebtoken';
import { UserRole } from '../models/User';
import { Types } from 'mongoose';

export const generateToken = (userId: Types.ObjectId, role: UserRole) => {
  return jwt.sign({ id: userId.toString(), role }, process.env.JWT_SECRET!, {
    expiresIn: '1d',
  });
};

export const verifyToken = (token: string): { id: string, role: UserRole } => {
  return jwt.verify(token, process.env.JWT_SECRET!) as { id: string, role: UserRole };
};