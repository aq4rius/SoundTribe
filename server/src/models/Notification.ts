import mongoose, { Schema, Document, Types } from 'mongoose';

export interface INotification extends Document {
  recipient: Types.ObjectId;
  type: string;
  content: string;
  read: boolean;
  createdAt: Date;
  relatedEntity?: {
    id: Types.ObjectId;
    type: string;
  };
}

const NotificationSchema = new Schema<INotification>({
  recipient: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  type: { type: String, required: true },
  content: { type: String, required: true },
  read: { type: Boolean, default: false },
  createdAt: { type: Date, default: Date.now },
  relatedEntity: {
    id: { type: Schema.Types.ObjectId },
    type: { type: String },
  },
});

const Notification = mongoose.model<INotification>('Notification', NotificationSchema);
export default Notification;
