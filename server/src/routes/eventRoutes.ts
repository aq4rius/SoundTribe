import express from 'express';
import { createEventPosting, getEventPosting, updateEventPosting, deleteEventPosting, searchEventPostings, getUserEvents } from '../controllers/eventController';
import { authMiddleware } from '../middleware/authMiddleware';

const router = express.Router();

router.post('/', authMiddleware, createEventPosting);
router.get('/user', authMiddleware, getUserEvents);
router.get('/:id', getEventPosting);
router.put('/:id', authMiddleware, updateEventPosting);
router.delete('/:id', authMiddleware, deleteEventPosting);
router.get('/', searchEventPostings);

export default router;