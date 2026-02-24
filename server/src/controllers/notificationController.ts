import { Request, Response, NextFunction } from 'express';
import Notification from '../models/Notification';
import { AuthRequest } from '../middleware/authMiddleware';
import { AppError } from '../utils/errorHandler';
import { getIO } from '../server';

// Utility to emit a real-time notification to the recipient's socket room
async function emitNotificationRealtime(notification: any) {
  try {
    const io = getIO();
    if (!io) return;
    // User room convention: User:<userId>
    const room = `User:${notification.recipient}`;
    io.to(room).emit('new-notification', notification);
  } catch (err) {
    // Don't block on error
    console.error('Realtime notification emit failed', err);
  }
}

export const getNotifications = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const userId = req.user?._id;
    if (!userId) throw new AppError('User not authenticated', 401);
    const notifications = await Notification.find({ recipient: userId }).sort({ createdAt: -1 });
    res.json(notifications);
  } catch (error) {
    next(error);
  }
};

export const markNotificationRead = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const userId = req.user?._id;
    const { notificationId } = req.params;
    if (!userId) throw new AppError('User not authenticated', 401);
    const notification = await Notification.findOneAndUpdate(
      { _id: notificationId, recipient: userId },
      { read: true },
      { new: true },
    );
    if (!notification) throw new AppError('Notification not found', 404);
    res.json(notification);
  } catch (error) {
    next(error);
  }
};

export const deleteNotification = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const userId = req.user?._id;
    const { notificationId } = req.params;
    if (!userId) throw new AppError('User not authenticated', 401);
    const notification = await Notification.findOneAndDelete({
      _id: notificationId,
      recipient: userId,
    });
    if (!notification) throw new AppError('Notification not found', 404);
    res.json({ success: true });
  } catch (error) {
    next(error);
  }
};

// Export for use in other controllers
export { emitNotificationRealtime };
