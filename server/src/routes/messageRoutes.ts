// server/src/routes/messageRoutes.ts

import express from 'express';
import { authMiddleware } from '../middleware/authMiddleware';
import {getUsersForSidebar, getMessages, sendMessage} from '../controllers/messageController';

const router = express.Router();

router.get("/users", authMiddleware, getUsersForSidebar);
router.get("/:id", authMiddleware, getMessages);

router.post("/:id", authMiddleware, sendMessage);

export default router;