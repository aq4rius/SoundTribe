import express from 'express';
import { authMiddleware } from '../middleware/authMiddleware';
import {getUsersForSidebar, getMessages, sendMessages} from '../controllers/messageController';

const router = express.Router();

router.get("/users", authMiddleware, getUsersForSidebar);
router.get("/:id", authMiddleware, getMessages);

router.post("/", authMiddleware, sendMessages);

export default router;