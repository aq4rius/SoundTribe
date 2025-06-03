// server/src/controllers/messageController.ts

import { AuthRequest } from '../middleware/authMiddleware';
import { Request, Response, NextFunction } from 'express';
import User, { IUser } from '../models/User';
import Message from '../models/Message';
import cloudinary from '../utils/cloudinary';
import { AppError } from '../utils/errorHandler';
import { getIO } from '../server';
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
      // Check file size before uploading to Cloudinary
      const maxSize = 10 * 1024 * 1024; // 10MB - Cloudinary's limit
      if (req.file.size > maxSize) {
        throw new AppError(
          `File too large. Maximum size is 10MB. Your file is ${(req.file.size / 1024 / 1024).toFixed(1)}MB.`,
          400
        );
      }
      
      try {
        // Upload buffer to cloudinary with better configuration
        attachmentUrl = await new Promise((resolve, reject) => {
          const uploadOptions = {
            resource_type: 'auto' as const,
            timeout: 120000, // 2 minutes timeout
            chunk_size: 6000000, // 6MB chunks for large files
            ...(req.file.size > 10 * 1024 * 1024 && {
              // For files larger than 10MB, use additional options
              eager_async: true,
              quality: 'auto:good', // Compress large images
            })
          };

          const stream = cloudinary.uploader.upload_stream(
            uploadOptions,
            (error, result) => {
              if (error) {
                // Only keep error logs
                console.error('❌ Cloudinary upload error:', error);
                return reject(new AppError(`Cloudinary upload failed: ${error.message}`, 500));
              }
              if (!result) {
                console.error('❌ Cloudinary upload failed: No result returned');
                return reject(new AppError('Cloudinary upload failed: No result', 500));
              }
              resolve(result.secure_url);
            },
          );
          stream.end(req.file.buffer);
        });
      } catch (cloudinaryError: any) {
        console.error('❌ Cloudinary upload failed:', cloudinaryError);
        throw new AppError(`File upload failed: ${cloudinaryError.message}`, 500);
      }
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
      status: 'sent' // Start with sent status
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

        // Check if receiver is online and mark as delivered
        const receiverSockets = await io.in(receiverRoom).fetchSockets();
        if (receiverSockets.length > 0) {
          // Receiver is online, mark as delivered
          newMessage.status = 'delivered';
          await newMessage.save();
          
          // Emit status update
          io.to(senderRoom).emit('message-status-update', {
            messageId: newMessage._id,
            status: 'delivered'
          });
        }
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
    console.error('❌ SendMessage error:', error);
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
          lastMessage: {
            text: msg.text,
            attachment: msg.attachment,
            createdAt: msg.createdAt,
            // Add info about who sent the last message
            isSentByMe: msg.sender.id.toString() === senderId && msg.sender.type === senderType
          },
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

export const addReaction = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { messageId } = req.params;
    const { emoji } = req.body;
    const userId = req.user?._id;
    
    if (!userId) {
      throw new AppError('User not authenticated', 401);
    }
    
    const message = await Message.findById(messageId);
    if (!message) {
      throw new AppError('Message not found', 404);
    }
    
    // Remove existing reaction from this user
    message.reactions = message.reactions?.filter(r => r.userId?.toString() !== userId.toString()) || [];
    
    // Add new reaction
    message.reactions.push({ userId, emoji, createdAt: new Date() });
    
    await message.save();

    // Emit real-time reaction event to both sender and receiver rooms
    const io = getIO();
    if (io && message.sender && message.receiver) {
      const senderRoom = `${message.sender.type}:${message.sender.id}`;
      const receiverRoom = `${message.receiver.type}:${message.receiver.id}`;
      const payload = {
        messageId: message._id,
        emoji,
        userId,
        senderId: message.sender.id,
        senderType: message.sender.type,
        receiverId: message.receiver.id,
        receiverType: message.receiver.type,
      };
      io.to(senderRoom).emit('message-reaction', payload);
      if (receiverRoom !== senderRoom) {
        io.to(receiverRoom).emit('message-reaction', payload);
      }
    }
    
    res.json(message);
  } catch (error) {
    next(error);
  }
};


export const getUnreadCounts = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { senderId, senderType } = req.query;
    
    const unreadCounts = await Message.aggregate([
      {
        $match: {
          'receiver.id': senderId,
          'receiver.type': senderType,
          status: { $in: ['sent', 'delivered'] }
        }
      },
      {
        $group: {
          _id: {
            senderId: '$sender.id',
            senderType: '$sender.type'
          },
          count: { $sum: 1 }
        }
      }
    ]);
    
    res.json(unreadCounts);
  } catch (error) {
    next(error);
  }
};
