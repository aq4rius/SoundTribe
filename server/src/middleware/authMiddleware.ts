import jwt from 'jsonwebtoken';
import { Request, Response, NextFunction } from 'express';

export const authMiddleware = (req: Request, res: Response, next: NextFunction) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) {
      return res.status(401).send('Unauthorized: No token provided');
    }
    jwt.verify(token, process.env.JWT_SECRET!);
    next();
  } catch (error) {
    res.status(401).send('Unauthorized: Invalid token');
  }
};