// server/src/routes/genreRoutes.ts

import express from 'express';
import { getAllGenres, createGenre, updateGenre, deleteGenre } from '../controllers/genreController';
import { authMiddleware, roleMiddleware } from '../middleware/authMiddleware';
import { UserRole } from '../models/User';

const router = express.Router();

router.get('/', getAllGenres);
router.post('/', authMiddleware, roleMiddleware(UserRole.ADMIN), createGenre);
router.put('/:id', authMiddleware, roleMiddleware(UserRole.ADMIN), updateGenre);
router.delete('/:id', authMiddleware, roleMiddleware(UserRole.ADMIN), deleteGenre);

export default router;