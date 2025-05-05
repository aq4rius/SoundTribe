<<<<<<< HEAD
import express, { NextFunction, Request, Response } from 'express';
=======
// server/src/routes/userRoutes.ts

import express from 'express';
>>>>>>> 2f6e93ed4b55c65df521d2598d73f9c4f48e5484
import User, { UserRole } from '../models/User';
import { getUserProfile, updateUserProfile, deleteUserProfile } from '../controllers/userController';
import { authMiddleware, roleMiddleware, AuthRequest } from '../middleware/authMiddleware';
import { AppError } from '../utils/errorHandler';

const router = express.Router();

router.get('/profile', authMiddleware, getUserProfile);
router.put('/profile', authMiddleware, updateUserProfile);
router.delete('/profile', authMiddleware, deleteUserProfile);


// Get all users (admin only)
router.get('/', authMiddleware, roleMiddleware(UserRole.ADMIN), async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const users = await User.find().select('-password');
    res.json(users);
  } catch (error) {
    next(new AppError('Server error', 500));
  }
});

// Update user role (admin only)
router.put('/:id/role', authMiddleware, roleMiddleware(UserRole.ADMIN), async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { role } = req.body;
    const user = await User.findByIdAndUpdate(req.params.id, { role }, { new: true }).select('-password');
    if (!user) {
      return next(new AppError('User not found', 404));
    }
    res.json(user);
  } catch (error) {
    next(new AppError('Server error', 500));
  }
});

export default router;