import { NotificationType } from '../entities/notification.entity';

export class NotificationResponseDto {
  id: string;
  user_id: string;
  title?: string;
  message: string;
  type: NotificationType;
  is_read: boolean;
  read: boolean;
  sender: string;
  created_at: Date;
  createdAt: Date;

  constructor(notification: any) {
    this.id = notification._id?.toString() || notification.id;
    this.user_id = notification.user_id || notification.userId;
    this.title = notification.title || notification.message?.slice(0, 50) || '';
    this.message = notification.message;
    this.type = notification.type || NotificationType.GENERAL;
    this.is_read = notification.is_read;
    this.read = notification.is_read;
    this.sender =
      this.type === NotificationType.SYSTEM ||
      this.type === NotificationType.GENERAL
        ? 'System'
        : 'Admin';
    this.created_at = notification.created_at || notification.createdAt || new Date();
    this.createdAt = this.created_at;
  }
}