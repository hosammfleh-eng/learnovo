import { Entity, ObjectIdColumn, Column } from 'typeorm';
import { ObjectId } from 'mongodb';

@Entity('TeacherAssignments')
export class TeacherAssignment {
  @ObjectIdColumn()
  _id: ObjectId;

  @Column({ type: 'string' })
  course_id: string;

  @Column({ type: 'string' })
  teacher_id: string;

  @Column({ type: 'date', default: () => 'new Date()' })
  assigned_date: Date;

  @Column({ type: 'boolean', default: true })
  is_active: boolean;

  @Column({ type: 'boolean', default: true })
  can_grade: boolean;

 
  @Column({ type: 'date', default: () => 'new Date()' })
  created_at: Date;

  @Column({ type: 'date', default: () => 'new Date()' })
  updated_at: Date;
}