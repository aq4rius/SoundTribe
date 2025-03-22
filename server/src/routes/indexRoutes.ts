// server/src/routes/index.ts

import express from 'express';
import authRoutes from './authRoutes';
import userRoutes from './userRoutes';
import genreRoutes from './genreRoutes';
import artistProfileRoutes from './artistProfileRoutes';
import eventPostingRoutes from './eventRoutes';
import applicationRoutes from './applicationRoutes';
import messageRoutes from './messageRoutes';

const router = express.Router();

router.use('/auth', authRoutes);
router.use('/users', userRoutes);
router.use('/genres', genreRoutes);
router.use('/artist-profiles', artistProfileRoutes);
router.use('/event-postings', eventPostingRoutes);
router.use('/applications', applicationRoutes);
router.use('/messages', messageRoutes);

export default router;