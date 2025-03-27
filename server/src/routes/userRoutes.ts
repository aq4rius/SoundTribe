// server/src/routes/userRoutes.ts

import express from 'express';
import User, { UserRole } from '../models/User';
import { getUserProfile, updateUserProfile, deleteUserProfile } from '../controllers/userController';
import { authMiddleware, roleMiddleware, AuthRequest } from '../middleware/authMiddleware';

const router = express.Router();

router.get('/profile', authMiddleware, getUserProfile);
router.put('/profile', authMiddleware, updateUserProfile);
router.delete('/profile', authMiddleware, deleteUserProfile);


// Get all users (admin only)
router.get('/', authMiddleware, roleMiddleware(UserRole.ADMIN), async (req: AuthRequest, res) => {
  try {
    const users = await User.find().select('-password');
    res.json(users);
  } catch (error) {
    res.status(500).send('Server error');
  }
});

// Update user role (admin only)
router.put('/:id/role', authMiddleware, roleMiddleware(UserRole.ADMIN), async (req: AuthRequest, res) => {
  try {
    const { role } = req.body;
    const user = await User.findByIdAndUpdate(req.params.id, { role }, { new: true }).select('-password');
    if (!user) {
      return res.status(404).send('User not found');
    }
    res.json(user);
  } catch (error) {
    res.status(500).send('Server error');
  }
});

export default router;