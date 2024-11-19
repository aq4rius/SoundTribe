// server/src/routes/artistProfileRoutes.ts

import express from 'express';
import { createArtistProfile, getArtistProfile, updateArtistProfile, deleteArtistProfile, getUserArtistProfiles, searchArtistProfiles } from '../controllers/artistProfileController';
import { authMiddleware } from '../middleware/authMiddleware';

const router = express.Router();


router.get('/user', authMiddleware, getUserArtistProfiles);
router.post('/', authMiddleware, createArtistProfile);
router.get('/search', searchArtistProfiles);
router.get('/:id', getArtistProfile);
router.put('/:id', authMiddleware, updateArtistProfile);
router.delete('/:id', authMiddleware, deleteArtistProfile);

export default router;
