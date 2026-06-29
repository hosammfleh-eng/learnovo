import { Entity, ObjectIdColumn, Column } from 'typeorm';
import { ObjectId } from 'mongodb';

export enum EnrollmentStatus {
  PENDING = 'Pending',
  APPROVED = 'Approved',
  REJECTED = 'Rejected',
  DROPPED = 'Dropped',
  COMPLETED = 'Completed',
}

@Entity('Enrollments')
export class Enrollment {
  @ObjectIdColumn()
  _id: ObjectId;

  @Column({ type: 'string' })
  student_id: string;

  @Column({ type: 'string' })
  course_id: string;

  @Column({ type: 'date', default: () => 'new Date()' })
  enrollment_date: Date;

  @Column({
    type: 'string',
    enum: EnrollmentStatus,
    default: EnrollmentStatus.PENDING,
  })
  status: EnrollmentStatus;

  @Column({ type: 'date', default: () => 'new Date()' })
  created_at: Date;

  @Column({ type: 'date', default: () => 'new Date()' })
  updated_at: Date;
}

