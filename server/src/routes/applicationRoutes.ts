import express from 'express';
import { submitApplication, getApplication, updateApplicationStatus, getApplicationsForJob, getUserApplications } from '../controllers/applicationController';
import { authMiddleware } from '../middleware/authMiddleware';

const router = express.Router();

router.post('/', authMiddleware, submitApplication);
router.get('/:id', authMiddleware, getApplication);
router.patch('/:id/status', authMiddleware, updateApplicationStatus);
router.get('/job/:jobId', authMiddleware, getApplicationsForJob);
router.get('/my-applications', authMiddleware, getUserApplications);

export default router;