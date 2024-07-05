import { Request, Response, NextFunction } from 'express';
import { verifyToken } from '../utils/jwtUtils';
import { UserRole } from '../models/User';

export interface AuthRequest extends Request {
  user?: { id: string; role: UserRole };
}

export const authMiddleware = (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) {
      return res.status(401).send('Unauthorized: No token provided');
    }
    const decoded = verifyToken(token);
    req.user = { id: decoded.id, role: decoded.role };
    next();
  } catch (error) {
    res.status(401).send('Unauthorized: Invalid token');
  }
};

export const roleMiddleware = (...roles: UserRole[]) => {
  return (req: AuthRequest, res: Response, next: NextFunction) => {
    if (!req.user) {
      return res.status(401).send('Unauthorized: No user found');
    }
    if (!roles.includes(req.user.role)) {
      return res.status(403).send('Forbidden: Insufficient permissions');
    }
    next();
  };
};