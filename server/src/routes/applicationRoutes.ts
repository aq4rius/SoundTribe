// server/src/routes/applicationRoutes.ts

import express from 'express';
import { submitApplication, getApplication, updateApplicationStatus, getApplicationsForEvent, getUserApplications } from '../controllers/applicationController';
import { authMiddleware } from '../middleware/authMiddleware';

const router = express.Router();


router.get('/my-applications', authMiddleware, getUserApplications);
router.post('/', authMiddleware, submitApplication);
router.get('/:id', authMiddleware, getApplication);
router.patch('/:id/status', authMiddleware, updateApplicationStatus);
router.get('/event/:eventId', authMiddleware, getApplicationsForEvent);


export default router;