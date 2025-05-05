import { AuthRequest } from '../middleware/authMiddleware';
import { Response, NextFunction } from 'express';
import User, { IUser } from '../models/User';
import Message from '../models/Message';
import cloudinary from '../utils/cloudinary';
import { AppError } from '../utils/errorHandler';

export const getUsersForSidebar = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const loggedInUserId = req.user?._id;
    
    if (!loggedInUserId) {
     throw new AppError('User not authenticated', 401);
    }
    
    const filteredUsers = await User.find({ _id: { $ne: loggedInUserId } }).select('-password');
    
    res.status(200).json(filteredUsers);
  } catch (error) {
    console.error('Error in getUsersForSidebar:', error);
    next(error);
  }
};

export const getMessages = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const loggedInUserId = req.user?._id;
    const otherUserId = req.params.id; 
    if (!loggedInUserId || !otherUserId) {
      throw new AppError('User not authenticated or other user ID not provided', 401);
    }

    const messages = await Message.find({
      $or: [
        { sender: loggedInUserId, receiver: otherUserId },
        { sender: otherUserId, receiver: loggedInUserId }
      ]
    }).sort({ timestamp: 1 });

    res.status(200).json(messages);
  } catch (error) {
    console.error('Error in getMessages:', error);
    next(error);
  }
};

export const sendMessage = async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
        const {text, attachment} = req.body;
        const {id: receiverId} = req.params;
        const senderId = req.user?._id;

        if (!senderId) {
           throw new AppError('User not authenticated', 401);
        }

        let attachmentUrl;
        if(attachment) {
            const uploadResponse = await cloudinary.uploader.upload(attachment);
            attachmentUrl = uploadResponse.secure_url;
        }
        const newMessage = new Message({
            text,
            attachment: attachmentUrl,
            sender: senderId,
            receiver: receiverId
        });

        await newMessage.save();

        // todo: realtime functionality goes here => socket.io
        res.status(201).json({ message: newMessage });
    } catch (error) {
        next(error);
    }
}