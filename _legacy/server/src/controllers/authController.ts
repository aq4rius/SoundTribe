// server/src/controllers/authController.ts

import { Request, Response, NextFunction } from 'express';
import User, { UserRole, IUser } from '../models/User';
import { generateToken } from '../utils/jwtUtils';
import { AuthRequest } from '../middleware/authMiddleware';
import { validationResult } from 'express-validator';
import { AppError } from '../utils/errorHandler';
import crypto from 'crypto';
import nodemailer from 'nodemailer';

// --- EMAIL/SMTP UTILS ---
function shouldSendEmail() {
  return process.env.NODE_ENV !== 'development' && process.env.SMTP_HOST && process.env.SMTP_USER && process.env.SMTP_PASS;
}

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
    // Fix: use roles[0] or UserRole.USER for token, and return roles array
    const user = new User({ email, password, roles: [UserRole.ADMIN] });
    await user.save();
    const token = generateToken(user._id, user.roles[0] || UserRole.USER);
    res.status(201).send({ token, roles: user.roles });
  } catch (error) {
    next(error);
  }
};

// --- EMAIL VERIFICATION ---
export const sendVerificationEmail = async (user: IUser) => {
  const crypto = await import('crypto');
  const token = crypto.randomBytes(32).toString('hex');
  user.emailVerificationToken = token;
  user.emailVerificationExpires = new Date(Date.now() + 1000 * 60 * 60 * 24); // 24h
  await user.save();
  const verifyUrl = `${process.env.FRONTEND_URL || 'http://localhost:3000'}/auth/verify-email?token=${token}`;
  if (shouldSendEmail()) {
    const nodemailer = await import('nodemailer');
    const transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: Number(process.env.SMTP_PORT),
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    });
    await transporter.sendMail({
      to: user.email,
      from: process.env.SMTP_FROM || 'no-reply@soundtribe.com',
      subject: 'Verify your SoundTribe email',
      html: `<p>Click <a href="${verifyUrl}">here</a> to verify your email. This link is valid for 24 hours.</p>`
    });
  } else {
    console.log('[DEV] Email verification link:', verifyUrl);
  }
};

export const verifyEmail = async (req: Request, res: Response, next: NextFunction) => {
  const { token } = req.query;
  try {
    if (!token || typeof token !== 'string') {
      return res.status(400).json({ message: 'Invalid or missing token.' });
    }
    const user = await User.findOne({
      emailVerificationToken: token,
      emailVerificationExpires: { $gt: new Date() },
    });
    if (!user) {
      return res.status(400).json({ message: 'Invalid or expired verification token.' });
    }
    user.emailVerified = true;
    user.emailVerificationToken = undefined;
    user.emailVerificationExpires = undefined;
    await user.save();
    res.status(200).json({ message: 'Email verified successfully.' });
  } catch (error) {
    next(error);
  }
}

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
    await sendVerificationEmail(user);
    res.status(201).json({
      message: 'Registration successful. Please check your email to verify your account.'
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
    if (!user.emailVerified) {
      return res.status(403).json({ message: 'Please verify your email before logging in.' });
    }
    const token = generateToken(user._id, user.roles[0] || UserRole.USER);
    res.status(200).json({
      token,
      user: {
        id: user._id,
        username: user.username,
        email: user.email,
        roles: user.roles,
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
      roles: user.roles,
    });
  } catch (error: any) {
    console.error('Get current user error:', error);
    next(error);
  }
};

// --- PASSWORD RESET ---
export const forgotPassword = async (req: Request, res: Response, next: NextFunction) => {
  const { email } = req.body;
  try {
    const user = await User.findOne({ email });
    if (!user) {
      // For security, always respond with success
      return res.status(200).json({ message: 'If that email exists, a reset link has been sent.' });
    }
    const crypto = await import('crypto');
    const token = crypto.randomBytes(32).toString('hex');
    user.resetPasswordToken = token;
    user.resetPasswordExpires = new Date(Date.now() + 1000 * 60 * 60); // 1 hour
    await user.save();
    const resetUrl = `${process.env.FRONTEND_URL || 'http://localhost:3000'}/auth/reset-password?token=${token}`;
    if (shouldSendEmail()) {
      const nodemailer = await import('nodemailer');
      const transporter = nodemailer.createTransport({
        host: process.env.SMTP_HOST,
        port: Number(process.env.SMTP_PORT),
        auth: {
          user: process.env.SMTP_USER,
          pass: process.env.SMTP_PASS,
        },
      });
      await transporter.sendMail({
        to: user.email,
        from: process.env.SMTP_FROM || 'no-reply@soundtribe.com',
        subject: 'Reset your SoundTribe password',
        html: `<p>Click <a href="${resetUrl}">here</a> to reset your password. This link is valid for 1 hour.</p>`
      });
    } else {
      console.log('[DEV] Password reset link:', resetUrl);
    }
    res.status(200).json({ message: 'If that email exists, a reset link has been sent.' });
  } catch (error) {
    next(error);
  }
};

export const resetPassword = async (req: Request, res: Response, next: NextFunction) => {
  const { token, password } = req.body;
  try {
    const user = await User.findOne({
      resetPasswordToken: token,
      resetPasswordExpires: { $gt: new Date() },
    });
    if (!user) {
      return res.status(400).json({ message: 'Invalid or expired reset token.' });
    }
    user.password = password;
    user.resetPasswordToken = undefined;
    user.resetPasswordExpires = undefined;
    await user.save();
    res.status(200).json({ message: 'Password reset successful.' });
  } catch (error) {
    next(error);
  }
};

// --- RESEND VERIFICATION EMAIL ---
export const resendVerificationEmail = async (req: Request, res: Response, next: NextFunction) => {
  const { email } = req.body;
  try {
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ message: 'User not found.' });
    }
    if (user.emailVerified) {
      return res.status(400).json({ message: 'Email is already verified.' });
    }
    await sendVerificationEmail(user);
    res.status(200).json({ message: 'Verification email sent.' });
  } catch (error) {
    next(error);
  }
};
