import { Entity, ObjectIdColumn, Column } from 'typeorm';
import { ObjectId } from 'mongodb';

export enum NotificationType {
  ENROLLMENT = 'Enrollment',
  GRADE = 'Grade',
  APPROVAL = 'Approval',
  SYSTEM = 'System',
  GENERAL = 'General',
}

@Entity('Notifications')
export class Notification {
  @ObjectIdColumn()
  _id: ObjectId;

  @Column({ type: 'string' })
  user_id: string;

  @Column({ type: 'string', nullable: true })
  title?: string;

  @Column({ type: 'string' })
  message: string;

  @Column({ type: 'string', enum: NotificationType, default: NotificationType.GENERAL })
  type: NotificationType;

  @Column({ type: 'boolean', default: false })
  is_read: boolean;

  @Column({ type: 'date', default: () => 'new Date()' })
  created_at: Date;
}