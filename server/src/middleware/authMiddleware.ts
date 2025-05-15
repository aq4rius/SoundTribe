// server/src/middleware/authMiddleware.ts

import { Request, Response, NextFunction } from 'express';
import { verifyToken } from '../utils/jwtUtils';
import User, { IUser, UserRole } from '../models/User';
import { AppError } from '../utils/errorHandler';

export interface AuthRequest extends Request {
  user?: Partial<IUser>;
}

const roles = [UserRole.ADMIN, UserRole.ARTIST, UserRole.USER];

export const authMiddleware = async (req: AuthRequest, res: Response, next: NextFunction) => {
  const token = req.headers.authorization?.split(' ')[1];

  if (!token) {
    return next(new AppError('No token provided', 401));
  }

  try {
    const decoded = verifyToken(token);

    const user = await User.findById(decoded.id).select('-password');

    if (!user) {
      return next(new AppError('User not found', 401));
    }

    req.user = user;
    next();
  } catch (error) {
    console.error('=== Auth Middleware Error ===', error);
    next(new AppError('Invalid token', 401));
  }
};

export const roleMiddleware = (role: UserRole) => {
  return (req: AuthRequest, res: Response, next: NextFunction) => {
    if (!req.user || !roles.includes(req.user.role as UserRole)) {
      return next(new AppError('Access denied', 403));
    }
    if (req.user.role !== role) {
      return next(new AppError('Insufficient privileges', 403));
    }
    next();
  };
};
