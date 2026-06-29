import { Entity, ObjectIdColumn, Column } from 'typeorm';
import { ObjectId } from 'mongodb';

export enum CourseStatus {
  DRAFT = 'Draft',
  ACTIVE = 'Active',
  CLOSED = 'Closed',
  ARCHIVED = 'Archived',
}

@Entity('Courses')
export class Course {
  @ObjectIdColumn()
  _id: ObjectId;

  @Column({ type: 'string' })
  course_name: string;

  @Column({ type: 'string', unique: true })
  course_code: string;  
  @Column({ type: 'string', nullable: true })
  description: string | null;

  @Column({ type: 'number', default: 3 })
  credit_hours: number;

  @Column({ type: 'number', default: 30 })
  max_students: number;

  @Column({ type: 'number', default: 0 })
  current_students: number;

  
  @Column({ type: 'date', nullable: true })
  start_date: Date | null;

  @Column({ type: 'date', nullable: true })
  end_date: Date | null;

  @Column({ type: 'string', enum: CourseStatus, default: CourseStatus.DRAFT })
  status: CourseStatus;

  @Column({ type: 'string' })
  created_by: string;

  @Column({ type: 'date', default: () => 'new Date()' })
  created_at: Date;

  @Column({ type: 'date', default: () => 'new Date()' })
  updated_at: Date;
}