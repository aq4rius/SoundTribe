import { Request, Response } from 'express';
import User, { UserRole, IUser } from '../models/User';
import { generateToken } from '../utils/jwtUtils';
import { AuthRequest } from '../middleware/authMiddleware';

export const register = async (req: Request, res: Response) => {
  const { email, password, role } = req.body;
  try {
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).send('User already exists');
    }
    const user: IUser = new User({ email, password, role });
    await user.save();
    const token = generateToken(user._id, user.role);
    res.status(201).send({ token, role: user.role });
  } catch (error: any) {
    console.error('Registration error:', error);
    res.status(500).send({ message: 'Error registering new user', error: error.message });
  }
};

export const login = async (req: Request, res: Response) => {
  const { email, password } = req.body;
  try {
    const user: IUser | null = await User.findOne({ email });
    if (!user || !(await user.comparePassword(password))) {
      return res.status(401).send('Invalid email or password');
    }
    const token = generateToken(user._id, user.role);
    res.status(200).send({ token, role: user.role });
  } catch (error) {
    res.status(500).send('Error logging in');
  }
};

export const getCurrentUser = async (req: AuthRequest, res: Response) => {
  try {
    const user = await User.findById(req.user?._id).select('-password');
    if (!user) {
      return res.status(404).send('User not found');
    }
    res.json(user);
  } catch (error) {
    res.status(500).send('Server error');
  }
};