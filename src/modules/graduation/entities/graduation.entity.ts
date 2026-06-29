import { Entity, ObjectIdColumn, Column } from 'typeorm';
import { ObjectId } from 'mongodb';

export enum GraduationStatus {
  PENDING_RECOMMENDATION = 'pending_recommendation',
  RECOMMENDED = 'recommended',
  PENDING_APPROVAL = 'pending_approval',
  APPROVED = 'approved',
  GRADUATED = 'graduated',
  REJECTED = 'rejected',
}

@Entity('Graduations')
export class Graduation {
  @ObjectIdColumn()
  _id: ObjectId;

  @Column({ type: 'string' })
  student_user_id: string; 

  
  @Column({ type: 'string' })
  course_id: string; 


  @Column({ type: 'string', nullable: true })
  recommendation_by_teacher_id: string | null;

  @Column({ type: 'date', nullable: true })
  recommendation_date: Date | null;


  @Column({ type: 'string', nullable: true })
  approval_by_admin_id: string | null; 

  @Column({ type: 'date', nullable: true })
  approval_date: Date | null;

  @Column({ type: 'string', enum: GraduationStatus, default: GraduationStatus.PENDING_RECOMMENDATION })
  status: GraduationStatus;

  @Column({ type: 'string', nullable: true })
  certificate_path: string | null; // URL or path to PDF certificate

  @Column({ type: 'date', nullable: true })
  issue_date: Date | null; 

  @Column({ type: 'string', nullable: true })
   notes: string | null; 

   @Column({ type: 'string', nullable: true })
   is_deleted: boolean | null; 

  @Column({ type: 'date', default: () => 'new Date()' })
  created_at: Date;

  @Column({ type: 'date', default: () => 'new Date()' })
  updated_at: Date;
}