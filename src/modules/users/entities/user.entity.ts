import { Entity, ObjectIdColumn, Column } from 'typeorm';
import { ObjectId } from 'mongodb';
import { UserRole, UserStatus } from '../../../common/enums/user-role.enum';

@Entity('Users')
export class User {
  @ObjectIdColumn()
  _id: ObjectId;

  @Column({ type: 'string' })
  full_name: string;

  @Column({ type: 'string', unique: true })
  email: string;

  @Column({ type: 'string' })
  password_hash: string;

  @Column({ type: 'string', nullable: true })
  phone: string;

  @Column({ type: 'string', enum: UserRole })
  role: UserRole;

  @Column({ type: 'string', enum: UserStatus, default: UserStatus.PENDING })
  status: UserStatus;

  @Column({ type: 'date', default: () => 'new Date()' })
  created_at: Date;

  @Column({ type: 'date', default: () => 'new Date()' })
  updated_at: Date;
}