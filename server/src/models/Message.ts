// server/src/models/Message.ts

import mongoose, { Types, Document, Schema } from 'mongoose';

export interface IMessage extends Document {
    sender: Types.ObjectId;
    receiver: Types.ObjectId;
    text?: string;
    attachment?: string;
    createdAt: Date;
    updatedAt: Date;
};

const MessageSchema: Schema = new Schema({
    sender: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    receiver: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
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