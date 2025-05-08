// server/src/controllers/messageController.ts

import { AuthRequest } from '../middleware/authMiddleware';
import { Response, NextFunction } from 'express';
import User, { IUser } from '../models/User';
import Message from '../models/Message';
import cloudinary from '../utils/cloudinary';
import { AppError } from '../utils/errorHandler';
import { getIO } from '../server';

export const getUsersForSidebar = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const loggedInUserId = req.user?._id;
    if (!loggedInUserId) {
      throw new AppError('User not authenticated', 401);
    }
    // Instead of users, return artist profiles and events owned by the user
    const artistProfiles = await (await import('../models/ArtistProfile')).default.find({ user: loggedInUserId });
    const events = await (await import('../models/Event')).default.find({ owner: loggedInUserId });
    res.status(200).json({ artistProfiles, events });
  } catch (error) {
    next(error);
  }
};

export const getMessages = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    // sender and receiver info should be passed as query params or body
    const { senderId, senderType, receiverId, receiverType } = req.query;
    if (!senderId || !senderType || !receiverId || !receiverType) {
      throw new AppError('Missing sender/receiver info', 400);
    }
    const messages = await Message.find({
      $or: [
        { 'sender.id': senderId, 'sender.type': senderType, 'receiver.id': receiverId, 'receiver.type': receiverType },
        { 'sender.id': receiverId, 'sender.type': receiverType, 'receiver.id': senderId, 'receiver.type': senderType }
      ]
    }).sort({ createdAt: 1 });
    res.status(200).json(messages);
  } catch (error) {
    next(error);
  }
};

export const sendMessage = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { text, attachment, senderId, senderType, receiverId, receiverType } = req.body;
    const userId = req.user?._id;
    if (!userId) {
      throw new AppError('User not authenticated', 401);
    }
    // Validate sender ownership
    if (senderType === 'ArtistProfile') {
      const ArtistProfile = (await import('../models/ArtistProfile')).default;
      const profile = await ArtistProfile.findOne({ _id: senderId, user: userId });
      if (!profile) throw new AppError('You do not own this artist profile', 403);
    } else if (senderType === 'Event') {
      const Event = (await import('../models/Event')).default;
      const event = await Event.findOne({ _id: senderId, owner: userId });
      if (!event) throw new AppError('You do not own this event', 403);
    } else {
      throw new AppError('Invalid sender type', 400);
    }
    let attachmentUrl;
    if (attachment) {
      const uploadResponse = await cloudinary.uploader.upload(attachment);
      attachmentUrl = uploadResponse.secure_url;
    }
    const newMessage = new Message({
      text,
      attachment: attachmentUrl,
      sender: { id: senderId, type: senderType },
      receiver: { id: receiverId, type: receiverType }
    });
    await newMessage.save();

    // Emit real-time message to both sender and receiver rooms
    const io = getIO();
    if (io) {
      const senderRoom = `${senderType}:${senderId}`;
      const receiverRoom = `${receiverType}:${receiverId}`;
      io.to(senderRoom).emit('new-message', newMessage);
      if (receiverRoom !== senderRoom) {
        io.to(receiverRoom).emit('new-message', newMessage);
      }
    }

    res.status(201).json({ message: newMessage });
  } catch (error) {
    next(error);
  }
};

// Get all unique conversation partners for a sender, with last message for each
export const getConversations = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { senderId, senderType } = req.query;
    if (!senderId || !senderType) {
      throw new AppError('Missing sender info', 400);
    }
    // Find all messages where sender or receiver matches
    const messages = await Message.find({
      $or: [
        { 'sender.id': senderId, 'sender.type': senderType },
        { 'receiver.id': senderId, 'receiver.type': senderType }
      ]
    }).sort({ createdAt: -1 }); // newest first

    // Group by the other entity (conversation partner)
    const conversationsMap = new Map();
    for (const msg of messages) {
      // Determine the partner entity
      let partner: any;
      if (msg.sender.id.toString() === senderId && msg.sender.type === senderType) {
        partner = msg.receiver;
      } else {
        partner = msg.sender;
      }
      const key = partner.id + ':' + partner.type;
      if (!conversationsMap.has(key)) {
        conversationsMap.set(key, {
          entity: { _id: partner.id, type: partner.type, name: undefined },
          lastMessage: msg
        });
      }
    }
    // Fetch names for all partners (could be ArtistProfile or Event)
    const entitiesToFetch = Array.from(conversationsMap.values());
    const artistIds = entitiesToFetch.filter(e => e.entity.type === 'ArtistProfile').map(e => e.entity._id);
    const eventIds = entitiesToFetch.filter(e => e.entity.type === 'Event').map(e => e.entity._id);
    let artistProfiles: any[] = [];
    let events: any[] = [];
    if (artistIds.length > 0) {
      artistProfiles = await (await import('../models/ArtistProfile')).default.find({ _id: { $in: artistIds } });
    }
    if (eventIds.length > 0) {
      events = await (await import('../models/Event')).default.find({ _id: { $in: eventIds } });
    }
    // Attach names
    for (const conv of entitiesToFetch) {
      if (conv.entity.type === 'ArtistProfile') {
        const found = artistProfiles.find((a: any) => a._id.toString() === conv.entity._id.toString());
        conv.entity.name = found ? found.stageName : 'Unknown Artist';
      } else if (conv.entity.type === 'Event') {
        const found = events.find((e: any) => e._id.toString() === conv.entity._id.toString());
        conv.entity.name = found ? found.title : 'Unknown Event';
      }
    }
    res.status(200).json(entitiesToFetch);
  } catch (error) {
    next(error);
  }
};