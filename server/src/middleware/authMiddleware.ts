import { Request, Response, NextFunction } from 'express';
import { verifyToken } from '../utils/jwtUtils';
import User, { IUser, UserRole } from '../models/User';

export interface AuthRequest extends Request {
  user?: Partial<IUser>;
}

const roles = [UserRole.ADMIN, UserRole.ARTIST, UserRole.USER];

export const authMiddleware = async (req: AuthRequest, res: Response, next: NextFunction) => {
  
  const token = req.headers.authorization?.split(' ')[1];

  if (!token) {
    return res.status(401).json({ message: 'No token provided' });
  }

  try {
    const decoded = verifyToken(token);
    
    const user = await User.findById(decoded.id).select('-password');
    
    if (!user) {
      return res.status(401).json({ message: 'User not found' });
    }
    
    req.user = user;
    next();
  } catch (error) {
    console.error('=== Auth Middleware Error ===', error);
    res.status(401).json({ message: 'Invalid token' });
  }
};

export const roleMiddleware = (role: UserRole) => {
  return (req: AuthRequest, res: Response, next: NextFunction) => {
    if (!req.user || !roles.includes(req.user.role as UserRole)) {
      return res.status(403).json({ message: 'Access denied' });
    }
    if (req.user.role !== role) {
      return res.status(403).json({ message: 'Insufficient privileges' });
    }
    next();
  };
};