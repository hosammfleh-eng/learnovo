import { Entity, ObjectIdColumn, Column } from 'typeorm';
import { ObjectId } from 'mongodb';

export enum StudentStatus {
  ACTIVE = 'Active',
  INACTIVE = 'Inactive',
  GRADUATED = 'Graduated',
  SUSPENDED = 'Suspended',
  PENDING = 'Pending',
}

export enum EnrollmentStatus {
  PENDING = 'Pending',
  APPROVED = 'Approved',
  REJECTED = 'Rejected',
  DROPPED = 'Dropped',
  COMPLETED = 'Completed',
}

export enum GraduationStatus {
  NOT_ELIGIBLE = 'NotEligible',
  ELIGIBLE = 'Eligible',
  APPLIED = 'Applied',
  APPROVED = 'Approved',
  REJECTED = 'Rejected',
  COMPLETED = 'Completed',
}

@Entity('Students')
export class Student {
 
  @ObjectIdColumn()
  _id: ObjectId;

  @Column({ type: 'string', unique: true })
  user_id: string;  


  @Column({ type: 'string', unique: true })
  student_id: string;
 
 
  @Column({ type: 'string', enum: EnrollmentStatus, default: EnrollmentStatus.PENDING })
  enrollment_status: EnrollmentStatus;  

  @Column({ type: 'string', enum: GraduationStatus, default: GraduationStatus.NOT_ELIGIBLE })
  graduation_status: GraduationStatus;  
  @Column({ type: 'date', default: () => 'new Date()' })
  registered_at: Date;  
 

 
 
}