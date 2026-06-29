import { Entity, ObjectIdColumn, Column } from 'typeorm';
import { ObjectId } from 'mongodb';

export enum TeacherSpecialization {
  MATH = 'Mathematics',
  PHYSICS = 'Physics',
  CHEMISTRY = 'Chemistry',
  BIOLOGY = 'Biology',
  COMPUTER_SCIENCE = 'Computer Science',
  ENGLISH = 'English',
  ARABIC = 'Arabic',
  HISTORY = 'History',
  GEOGRAPHY = 'Geography',
  ART = 'Art',
  MUSIC = 'Music',
  PHYSICAL_EDUCATION = 'Physical Education',
  OTHER = 'Other',
}


@Entity('TeacherProfiles')
export class TeacherProfile {
  @ObjectIdColumn()
  _id: ObjectId;

  @Column({ type: 'string', unique: true })
  user_id: string;

  @Column({ type: 'string' })
  specialization: TeacherSpecialization;
 
  @Column({ type: 'date', default: () => 'new Date()' })
  hire_date: Date;
  
}