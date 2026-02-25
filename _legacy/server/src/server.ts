// server/src/server.ts

import express, { Express, Request, Response, NextFunction } from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { connectToDatabase } from './database';
import routes from './routes/indexRoutes';
import { errorHandler } from './utils/errorHandler';
import helmet from 'helmet';
import morgan from 'morgan';
import { apiLimiter } from './middleware/rateLimiter';
import http from 'http';
import { Server as SocketIOServer } from 'socket.io';

dotenv.config();

const app: Express = express();
const allowedOrigins = [
  'http://localhost:5173',
  'http://localhost:3000',
  'http://localhost:3001', // Added for Next.js dev server
  'http://localhost:5000',
  'http://127.0.0.1:5173',
  'http://127.0.0.1:3000',
  'http://127.0.0.1:3001', // Added for Next.js dev server
  'http://127.0.0.1:5000',
  'https://soundtribe.vercel.app',
  'https://soundtribe-aq4rius-projects.vercel.app',
  'https://soundtribe-git-main-aq4rius-projects.vercel.app',
  'https://soundtribe.onrender.com',
];

app.use(
  cors({
    origin: function (origin, callback) {
      if (!origin || allowedOrigins.indexOf(origin) !== -1) {
        callback(null, true);
      } else {
        callback(new Error('Not allowed by CORS'));
      }
    },
    credentials: true,
  }),
);

app.use('/api/', apiLimiter);
app.use(helmet());
app.use(morgan('dev'));
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));

// Use routes
app.use('/api', routes);

app.get('/api/health', (_req: Request, res: Response) => {
  res.status(200).send('Server is running');
});

app.use(errorHandler);

const uri: string = process.env.MONGODB_URI || 'mongodb://localhost:27017/soundtribe';
const port: number = parseInt(process.env.PORT || '5000', 10);

let io: SocketIOServer | null = null;

async function startServer(): Promise<void> {
  try {
    await connectToDatabase(uri);
    const server = http.createServer(app);
    io = new SocketIOServer(server, {
      cors: {
        origin: allowedOrigins,
        credentials: true,
      },
    });

    // Socket.io connection logic
    io.on('connection', (socket) => {
      // Clean up: Remove all console.log except for error logs

      // Client should emit 'join-entity' for each sender entity they want to join
      socket.on('join-entity', ({ entityId, entityType }) => {
        const room = `${entityType}:${entityId}`;
        socket.join(room);
        // Mark messages as delivered when user comes online
        socket.emit('mark-delivered', { entityId, entityType });
      });

      socket.on('leave-entity', ({ entityId, entityType }) => {
        const room = `${entityType}:${entityId}`;
        socket.leave(room);
      });

      // Handle typing events
      socket.on('typing', (data) => {
        const { senderId, senderType, receiverId, receiverType } = data;
        const receiverRoom = `${receiverType}:${receiverId}`;
        socket.to(receiverRoom).emit('user-typing', {
          senderId,
          senderType,
          conversationId: receiverId,
        });
      });

      socket.on('stop-typing', (data) => {
        const { senderId, senderType, receiverId, receiverType } = data;
        const receiverRoom = `${receiverType}:${receiverId}`;
        socket.to(receiverRoom).emit('user-stopped-typing', {
          senderId,
          senderType,
          conversationId: receiverId,
        });
      });

      // Handle conversation opened (mark as read)
      socket.on('conversation-opened', async (data) => {
        const { senderId, senderType, receiverId, receiverType } = data;
        try {
          // Mark messages as read
          const Message = (await import('./models/Message')).default;
          const updatedMessages = await Message.find({
            'sender.id': receiverId,
            'sender.type': receiverType,
            'receiver.id': senderId,
            'receiver.type': senderType,
            status: { $ne: 'read' },
          });
          const updateResult = await Message.updateMany(
            {
              'sender.id': receiverId,
              'sender.type': receiverType,
              'receiver.id': senderId,
              'receiver.type': senderType,
              status: { $ne: 'read' },
            },
            { status: 'read' },
          );

          // Notify sender that messages were read
          const senderRoom = `${receiverType}:${receiverId}`;
          if (io && updatedMessages.length > 0) {
            io.to(senderRoom).emit('messages-read', {
              conversationId: senderId,
              senderType,
              receiverId,
              receiverType,
            });
          }

          // Emit to current user to update unread counts
          socket.emit('messages-marked-read', {
            senderId,
            senderType,
            receiverId,
            receiverType,
          });
        } catch (error) {
          console.error('Error marking messages as read:', error);
        }
      });

      // Handle mark messages as delivered
      socket.on('mark-delivered', async (data) => {
        const { entityId, entityType } = data;

        try {
          const Message = (await import('./models/Message')).default;
          // Find all messages that are being updated
          const updatedMessages = await Message.find({
            'receiver.id': entityId,
            'receiver.type': entityType,
            status: 'sent',
          });
          // Update their status to delivered
          await Message.updateMany(
            {
              'receiver.id': entityId,
              'receiver.type': entityType,
              status: 'sent',
            },
            { status: 'delivered' },
          );

          // For each sender, emit a 'messages-delivered' event to their room
          const ioInstance = io;
          if (ioInstance && updatedMessages.length > 0) {
            // Group by sender
            const senders = Array.from(new Set(updatedMessages.map((msg) => `${msg.sender.type}:${msg.sender.id}`)));
            for (const senderRoom of senders) {
              ioInstance.to(senderRoom).emit('messages-delivered', {
                receiverId: entityId,
                receiverType: entityType,
              });
            }
          }
        } catch (error) {
          console.error('Error marking messages as delivered:', error);
        }
      });

      socket.on('disconnect', () => {
        // No log needed
      });
    });

    server.listen(port, () => {
      console.log(`Server is running on PORT: ${port}`);
      console.log('Socket.io enabled');
    });
  } catch (error) {
    console.error('Failed to start the server:', error);
    process.exit(1);
  }
}

// Export io getter for use in controllers
export function getIO() {
  return io;
}

startServer();
