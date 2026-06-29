import { Entity, ObjectIdColumn, Column } from 'typeorm';
import { ObjectId } from 'mongodb';

export enum ExamType {
  CLASSWORK = 'Classwork',
  FINAL_EXAM = 'Final Exam',
  QUIZ = 'Quiz',
  PROJECT = 'Project',
  ASSIGNMENT = 'Assignment',
  MIDTERM = 'Midterm',
}

export enum ResultStatus {
  PASS = 'pass',
  FAIL = 'fail',
}

@Entity('Grades')
export class Grade {
  @ObjectIdColumn()
  _id: ObjectId;

  @Column({ type: 'string' })
  student_user_id: string; 

  @Column({ type: 'string' })
  course_id: string; 

  @Column({ type: 'string' })
  teacher_user_id: string; 

  @Column({ type: 'string', enum: ExamType })
  exam_type: ExamType;

  @Column({ type: 'number' })
  grade_value: number; 

  @Column({ type: 'number' })
  weight: number; 

  @Column({ type: 'number', default: 0 })
  total_grade: number;

  @Column({ type: 'string', enum: ResultStatus, nullable: true })
  result_status: ResultStatus | null;


  @Column({ type: 'string', nullable: true })
  modified_by: string | null; 

  @Column({ type: 'boolean', default: false })
  is_deleted: boolean;

  @Column({ type: 'date', default: () => 'new Date()' })
  created_at: Date;

  @Column({ type: 'date', default: () => 'new Date()' })
  updated_at: Date;
}
