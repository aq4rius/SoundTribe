// server/src/routes/messageRoutes.ts

import express from 'express';
import { authMiddleware } from '../middleware/authMiddleware';
import {
  getUsersForSidebar,
  getMessages,
  sendMessage,
  getConversations,
  deleteConversation,
  markMessagesAsRead,
  addReaction,
  getUnreadCounts,
} from '../controllers/messageController';
import upload from '../utils/multer';
import type { Request, Response, NextFunction } from 'express';

const router = express.Router();

router.get('/users', authMiddleware, getUsersForSidebar);
router.get('/convo', authMiddleware, getMessages); // expects senderId, senderType, receiverId, receiverType as query params
router.get('/conversations', authMiddleware, getConversations); // expects senderId, senderType as query params

router.post('/', authMiddleware, (req: Request, res: Response, next: NextFunction) => {
  // @ts-ignore
  upload.single('file')(req, res, (err: any) => {
    if (err) return next(err);
    // @ts-ignore
    sendMessage(req, res, next);
  });
});
router.put('/mark-read', authMiddleware, markMessagesAsRead);
router.post('/:messageId/reaction', authMiddleware, addReaction);
router.get('/unread-counts', authMiddleware, getUnreadCounts);
router.delete('/convo', authMiddleware, deleteConversation); // expects senderId, senderType, receiverId, receiverType as query params

export default router;
