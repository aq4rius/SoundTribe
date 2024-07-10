import express from 'express';
import { createJobPosting, getJobPosting, updateJobPosting, deleteJobPosting, searchJobPostings } from '../controllers/jobPostingController';
import { authMiddleware } from '../middleware/authMiddleware';

const router = express.Router();

router.post('/', authMiddleware, createJobPosting);
router.get('/:id', getJobPosting);
router.put('/:id', authMiddleware, updateJobPosting);
router.delete('/:id', authMiddleware, deleteJobPosting);
router.get('/', searchJobPostings);

export default router;