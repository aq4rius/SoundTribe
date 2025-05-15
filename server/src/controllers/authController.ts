// server/src/controllers/authController.ts

import { Request, Response, NextFunction } from 'express';
import User, { UserRole, IUser } from '../models/User';
import { generateToken } from '../utils/jwtUtils';
import { AuthRequest } from '../middleware/authMiddleware';
import { validationResult } from 'express-validator';
import { AppError } from '../utils/errorHandler';

export const createAdmin = async (req: Request, res: Response, next: NextFunction) => {
  const { email, password, adminSecret } = req.body;

  // Check if the provided admin secret matches the environment variable
  if (adminSecret !== process.env.ADMIN_SECRET) {
    throw new AppError('Invalid admin secret', 403);
  }

  try {
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      throw new AppError('User already exists', 400);
    }
    const user = new User({ email, password, role: UserRole.ADMIN });
    await user.save();
    const token = generateToken(user._id, user.role);
    res.status(201).send({ token, role: user.role });
  } catch (error) {
    next(error);
  }
};

export const register = async (req: Request, res: Response, next: NextFunction) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  const { username, email, password } = req.body;
  try {
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      throw new AppError('User with this email already exists', 400);
    }
    const user: IUser = new User({ username, email, password });
    await user.save();
    const token = generateToken(user._id, user.role);
    res.status(201).json({
      token,
      user: {
        id: user._id,
        username: user.username,
        email: user.email,
        role: user.role,
        profileCompleted: user.profileCompleted,
      },
    });
  } catch (error: any) {
    console.error('Registration error:', error);
    next(error);
  }
};

export const login = async (req: Request, res: Response, next: NextFunction) => {
  const { email, password } = req.body;
  try {
    const user: IUser | null = await User.findOne({ email });
    if (!user || !(await user.comparePassword(password))) {
      throw new AppError('Invalid email or password', 401);
    }
    const token = generateToken(user._id, user.role);
    res.status(200).json({
      token,
      user: {
        id: user._id,
        username: user.username,
        email: user.email,
        role: user.role,
        profileCompleted: user.profileCompleted,
      },
    });
  } catch (error: any) {
    console.error('Login error:', error);
    next(error);
  }
};

export const getCurrentUser = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const user = await User.findById(req.user?._id).select('-password');
    if (!user) {
      throw new AppError('User not found', 404);
    }
    res.json({
      id: user._id,
      username: user.username,
      email: user.email,
      role: user.role,
      profileCompleted: user.profileCompleted,
    });
  } catch (error: any) {
    console.error('Get current user error:', error);
    next(error);
  }
};
