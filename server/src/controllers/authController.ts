// server/src/controllers/authController.ts

import { Request, Response } from 'express';
import User, { UserRole, IUser } from '../models/User';
import { generateToken } from '../utils/jwtUtils';
import { AuthRequest } from '../middleware/authMiddleware';
import { validationResult } from 'express-validator';

export const createAdmin = async (req: Request, res: Response) => {
  const { email, password, adminSecret } = req.body;
  
  // Check if the provided admin secret matches the environment variable
  if (adminSecret !== process.env.ADMIN_SECRET) {
    return res.status(403).send('Invalid admin secret');
  }

  try {
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).send('User already exists');
    }
    const user = new User({ email, password, role: UserRole.ADMIN });
    await user.save();
    const token = generateToken(user._id, user.role);
    res.status(201).send({ token, role: user.role });
  } catch (error) {
    res.status(500).send('Error creating admin user');
  }
};

export const register = async (req: Request, res: Response) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  const { username, email, password } = req.body;
  try {
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: 'User with this email already exists' });
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
        profileCompleted: user.profileCompleted
      } 
    });
  } catch (error: any) {
    console.error('Registration error:', error);
    res.status(500).json({ message: 'Error registering new user', error: error.message });
  }
};

export const login = async (req: Request, res: Response) => {
  const { email, password } = req.body;
  try {
    const user: IUser | null = await User.findOne({ email });
    if (!user || !(await user.comparePassword(password))) {
      return res.status(401).json({ message: 'Invalid email or password' });
    }
    const token = generateToken(user._id, user.role);
    res.status(200).json({ 
      token, 
      user: {
        id: user._id,
        username: user.username,
        email: user.email,
        role: user.role,
        profileCompleted: user.profileCompleted
      } 
    });
  } catch (error: any) {
    console.error('Login error:', error);
    res.status(500).json({ message: 'Error logging in' });
  }
};

export const getCurrentUser = async (req: AuthRequest, res: Response) => {
  try {
    const user = await User.findById(req.user?._id).select('-password');
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    res.json({
      id: user._id,
      username: user.username,
      email: user.email,
      role: user.role,
      profileCompleted: user.profileCompleted
    });
  } catch (error: any) {
    console.error('Get current user error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};