/**
 * Notification types — mirrors server/src/models/Notification.ts
 */

export interface NotificationRelatedEntity {
  id: string;
  type: string;
}

export interface INotification {
  _id: string;
  recipient: string;
  type: string;
  content: string;
  read: boolean;
  createdAt: string;
  relatedEntity?: NotificationRelatedEntity;
}
