import { AuthRequest } from '../middleware/authMiddleware';
import { Response } from 'express';
import User, { IUser } from '../models/User';
import Message from '../models/Message';
import cloudinary from '../config/cloudinary';

export const getUsersForSidebar = async (req: AuthRequest, res: Response) => {
  try {
    const loggedInUserId = req.user?._id;
    
    if (!loggedInUserId) {
      return res.status(401).json({ message: 'User not authenticated' });
    }
    
    const filteredUsers = await User.find({ _id: { $ne: loggedInUserId } }).select('-password');
    
    res.status(200).json(filteredUsers);
  } catch (error) {
    console.error('Error in getUsersForSidebar:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

export const getMessages = async (req: AuthRequest, res: Response) => {
  try {
    const loggedInUserId = req.user?._id;
    const otherUserId = req.params.id; 
    if (!loggedInUserId || !otherUserId) {
      return res.status(401).json({ message: 'User not authenticated or other user not specified' });
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
    res.status(500).json({ message: 'Server error' });
  }
};

export const sendMessage = async (req: AuthRequest, res: Response) => {
    try {
        const {text, attachment} = req.body;
        const {id: receiverId} = req.params;
        const senderId = req.user?._id;

        let attachmentUrl;
        if(attachment) {
            const attachmentUrl = await cloudinary.uploader.upload(attachment);
            attachmentUrl = attachmentUrl.secure_url;
        }
        const newMessage = new Message({
            text,
            attachment: attachmentUrl,
            sender: senderId,
            receiver: receiverId
        });

        await newMessage.save();

        // todo: realtime functionality goes here => socket.io
        res.status(201).json({ message: 'Message sent successfully', message: newMessage });

    } catch (error) {
        console.error('Error in sendMessage:', error);
        res.status(500).json({ message: 'Server error' });
    }
}