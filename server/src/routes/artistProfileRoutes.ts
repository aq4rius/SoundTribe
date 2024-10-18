// server/src/routes/artistProfileRoutes.ts

import express from 'express';
import { createArtistProfile, getArtistProfile, updateArtistProfile, deleteArtistProfile, searchArtistProfiles, getUserArtistProfiles } from '../controllers/artistProfileController';
import { authMiddleware } from '../middleware/authMiddleware';

const router = express.Router();

router.post('/', authMiddleware, createArtistProfile);
router.get('/:id', getArtistProfile);
router.get('/user', authMiddleware, getUserArtistProfiles);
router.put('/:id', authMiddleware, updateArtistProfile);
router.delete('/:id', authMiddleware, deleteArtistProfile);
router.get('/', searchArtistProfiles);

export default router;