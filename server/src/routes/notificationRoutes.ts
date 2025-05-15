import express from 'express';
import { authMiddleware } from '../middleware/authMiddleware';
import {
  getNotifications,
  markNotificationRead,
  deleteNotification,
} from '../controllers/notificationController';

const router = express.Router();

router.get('/', authMiddleware, getNotifications);
router.put('/:notificationId', authMiddleware, markNotificationRead);
router.delete('/:notificationId', authMiddleware, deleteNotification);

export default router;
