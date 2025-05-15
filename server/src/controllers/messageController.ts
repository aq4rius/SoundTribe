// server/src/controllers/messageController.ts

import { AuthRequest } from '../middleware/authMiddleware';
import { Response, NextFunction } from 'express';
import User, { IUser } from '../models/User';
import Message from '../models/Message';
import cloudinary from '../utils/cloudinary';
import { AppError } from '../utils/errorHandler';
import { getIO } from '../server';
import type { Request } from 'express';
import Notification from '../models/Notification';

export const getUsersForSidebar = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const loggedInUserId = req.user?._id;
    if (!loggedInUserId) {
      throw new AppError('User not authenticated', 401);
    }
    // Instead of users, return artist profiles and events owned by the user
    const artistProfiles = await (
      await import('../models/ArtistProfile')
    ).default.find({ user: loggedInUserId });
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
    let { page, limit } = req.query;
    if (!senderId || !senderType || !receiverId || !receiverType) {
      throw new AppError('Missing sender/receiver info', 400);
    }
    // Pagination defaults
    const pageNum = parseInt(page as string) > 0 ? parseInt(page as string) : 1;
    const limitNum = parseInt(limit as string) > 0 ? parseInt(limit as string) : 50;
    const skip = (pageNum - 1) * limitNum;
    // Query for messages between the two entities
    const query = {
      $or: [
        {
          'sender.id': senderId,
          'sender.type': senderType,
          'receiver.id': receiverId,
          'receiver.type': receiverType,
        },
        {
          'sender.id': receiverId,
          'sender.type': receiverType,
          'receiver.id': senderId,
          'receiver.type': senderType,
        },
      ],
    };
    const total = await Message.countDocuments(query);
    const messages = await Message.find(query)
      .sort({ createdAt: -1 }) // newest first
      .skip(skip)
      .limit(limitNum)
      .lean();
    // Reverse to chronological order for display
    messages.reverse();
    const hasMore = skip + messages.length < total;
    res.status(200).json({ messages, hasMore, total });
  } catch (error) {
    next(error);
  }
};

export const sendMessage = async (
  req: AuthRequest & { file?: any },
  res: Response,
  next: NextFunction,
) => {
  try {
    const { text, senderId, senderType, receiverId, receiverType } = req.body;
    const userId = req.user && (req.user._id || req.user.id);
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
      const event = await Event.findOne({ _id: senderId, postedBy: userId });
      if (!event) throw new AppError('You do not own this event', 403);
    } else {
      throw new AppError('Invalid sender type', 400);
    }
    let attachmentUrl;
    if (req.file) {
      // Upload buffer to cloudinary using a Promise wrapper
      attachmentUrl = await new Promise((resolve, reject) => {
        const stream = cloudinary.uploader.upload_stream(
          { resource_type: 'auto' },
          (error, result) => {
            if (error || !result) return reject(new AppError('File upload failed', 500));
            resolve(result.secure_url);
          },
        );
        stream.end(req.file.buffer);
      });
    } else if (req.body.attachment) {
      // fallback for base64 string
      const uploadResponse = await cloudinary.uploader.upload(req.body.attachment);
      attachmentUrl = uploadResponse.secure_url;
    }
    const newMessage = new Message({
      text,
      attachment: attachmentUrl,
      sender: { id: senderId, type: senderType },
      receiver: { id: receiverId, type: receiverType },
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
    // Create notification for receiver
    try {
      await Notification.create({
        recipient: receiverId,
        type: 'new_message',
        content: text ? `New message: ${text.substring(0, 100)}` : 'New file received',
        relatedEntity: { id: newMessage._id, type: 'Message' },
      });
    } catch (err) {
      // Log but don't block message send
      console.error('Notification creation failed', err);
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
        { 'receiver.id': senderId, 'receiver.type': senderType },
      ],
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
          lastMessage: msg,
        });
      }
    }
    // Fetch names for all partners (could be ArtistProfile or Event)
    const entitiesToFetch = Array.from(conversationsMap.values());
    const artistIds = entitiesToFetch
      .filter((e) => e.entity.type === 'ArtistProfile')
      .map((e) => e.entity._id);
    const eventIds = entitiesToFetch
      .filter((e) => e.entity.type === 'Event')
      .map((e) => e.entity._id);
    let artistProfiles: any[] = [];
    let events: any[] = [];
    if (artistIds.length > 0) {
      artistProfiles = await (
        await import('../models/ArtistProfile')
      ).default.find({ _id: { $in: artistIds } });
    }
    if (eventIds.length > 0) {
      events = await (await import('../models/Event')).default.find({ _id: { $in: eventIds } });
    }
    // Attach names
    for (const conv of entitiesToFetch) {
      if (conv.entity.type === 'ArtistProfile') {
        const found = artistProfiles.find(
          (a: any) => a._id.toString() === conv.entity._id.toString(),
        );
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

// Delete all messages between two entities
export const deleteConversation = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { senderId, senderType, receiverId, receiverType } = req.query;
    if (!senderId || !senderType || !receiverId || !receiverType) {
      throw new AppError('Missing sender/receiver info', 400);
    }
    // Only allow if the user owns the sender entity
    const userId = req.user && (req.user._id || req.user.id);
    if (!userId) throw new AppError('User not authenticated', 401);
    let ownsSender = false;
    if (senderType === 'ArtistProfile') {
      const ArtistProfile = (await import('../models/ArtistProfile')).default;
      const profile = await ArtistProfile.findOne({ _id: senderId, user: userId });
      if (profile) ownsSender = true;
    } else if (senderType === 'Event') {
      const Event = (await import('../models/Event')).default;
      const event = await Event.findOne({ _id: senderId, postedBy: userId });
      if (event) ownsSender = true;
    }
    if (!ownsSender) throw new AppError('You do not own this sender entity', 403);
    // Delete all messages between the two entities
    await Message.deleteMany({
      $or: [
        {
          'sender.id': senderId,
          'sender.type': senderType,
          'receiver.id': receiverId,
          'receiver.type': receiverType,
        },
        {
          'sender.id': receiverId,
          'sender.type': receiverType,
          'receiver.id': senderId,
          'receiver.type': senderType,
        },
      ],
    });
    res.status(200).json({ success: true });
  } catch (error) {
    next(error);
  }
};
