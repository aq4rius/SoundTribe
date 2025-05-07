// server/src/models/Message.ts

import mongoose, { Types, Document, Schema } from 'mongoose';

export interface IMessage extends Document {
    sender: {
        id: Types.ObjectId;
        type: 'ArtistProfile' | 'Event';
    };
    receiver: {
        id: Types.ObjectId;
        type: 'ArtistProfile' | 'Event';
    };
    text?: string;
    attachment?: string;
    createdAt: Date;
    updatedAt: Date;
};

const MessageSchema: Schema = new Schema({
    sender: {
      id: {
        type: Schema.Types.ObjectId,
        required: true,
        refPath: 'sender.type',
      },
      type: {
        type: String,
        required: true,
        enum: ['ArtistProfile', 'Event'],
      },
    },
    receiver: {
      id: {
        type: Schema.Types.ObjectId,
        required: true,
        refPath: 'receiver.type',
      },
      type: {
        type: String,
        required: true,
        enum: ['ArtistProfile', 'Event'],
      },
    },
    text: {
      type: String,
    },
    attachment: {
      type: String,
    },
  },
    {timestamps: true}
  );

const Message = mongoose.model<IMessage>('Message', MessageSchema);

export default Message;