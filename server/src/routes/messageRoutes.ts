// server/src/routes/messageRoutes.ts

import express from 'express';
import { authMiddleware } from '../middleware/authMiddleware';
import {getUsersForSidebar, getMessages, sendMessage, getConversations, deleteConversation} from '../controllers/messageController';

const router = express.Router();

router.get("/users", authMiddleware, getUsersForSidebar);
router.get("/convo", authMiddleware, getMessages); // expects senderId, senderType, receiverId, receiverType as query params
router.get("/conversations", authMiddleware, getConversations); // expects senderId, senderType as query params

router.post("/", authMiddleware, sendMessage); // expects senderId, senderType, receiverId, receiverType, text, attachment in body
router.delete("/convo", authMiddleware, deleteConversation); // expects senderId, senderType, receiverId, receiverType as query params

export default router;