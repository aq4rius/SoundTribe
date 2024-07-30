// server/src/routes/index.ts

import express from 'express';
import authRoutes from './authRoutes';
import userRoutes from './userRoutes';
import genreRoutes from './genreRoutes';
import artistProfileRoutes from './artistProfileRoutes';
import jobPostingRoutes from './jobPostingRoutes';
import applicationRoutes from './applicationRoutes';

const router = express.Router();

router.use('/auth', authRoutes);
router.use('/users', userRoutes);
router.use('/genres', genreRoutes);
router.use('/artist-profiles', artistProfileRoutes);
router.use('/job-postings', jobPostingRoutes);
router.use('/applications', applicationRoutes);

export default router;