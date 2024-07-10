// server/src/routes/authRoutes.ts

import express, { Request, Response } from 'express';
import { register, login, getCurrentUser } from '../controllers/authController';
import { registerValidation, loginValidation } from '../validation/userValidation';
import { validationResult } from 'express-validator';
import { authMiddleware } from '../middleware/authMiddleware';

const router = express.Router();

router.post('/register', registerValidation, (req: Request, res: Response) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }
  register(req, res);
});

router.post('/login', loginValidation, (req: Request, res: Response) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }
  login(req, res);
});

router.get('/me', authMiddleware, getCurrentUser);

export default router;