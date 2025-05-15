// server/src/routes/authRoutes.ts

import express, { Request, Response, NextFunction } from 'express';
import { register, login, getCurrentUser, createAdmin } from '../controllers/authController';
import { registerValidation, loginValidation } from '../validation/userValidation';
import { validationResult } from 'express-validator';
import { authMiddleware } from '../middleware/authMiddleware';

const router = express.Router();

router.post('/create-admin', async (req, res, next) => {
  try {
    await createAdmin(req, res, next);
  } catch (error) {
    next(error);
  }
});

router.post(
  '/register',
  registerValidation,
  async (req: Request, res: Response, next: NextFunction) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    try {
      await register(req, res, next);
    } catch (error) {
      next(error);
    }
  },
);

router.post('/login', loginValidation, async (req: Request, res: Response, next: NextFunction) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }
  try {
    await login(req, res, next);
  } catch (error) {
    next(error);
  }
});

router.get('/me', authMiddleware, getCurrentUser);

export default router;
