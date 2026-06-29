import { ExamType, ResultStatus } from '../entities/grade.entity';

export class GradeResponseDto {
  id: string;
  student_user_id: string;
  student_name?: string;
  student_email?: string;
  course_id: string;
  course_name?: string;
  course_code?: string;
  teacher_user_id: string;
  teacher_name?: string;
  exam_type: ExamType;
  grade_value: number;
  weight: number;
  total_grade: number;
  result_status: ResultStatus | null;
  
  modified_by: string | null; 
  modified_by_name?: string;
  modified_at: Date | null; 
  is_deleted: boolean;
  created_at: Date;
  updated_at: Date;

  constructor(data: any, extra: any = {}) {
    this.id = data._id?.toString() || data.id;
    this.student_user_id = data.student_user_id;
    this.student_name = extra.student_name;
    this.student_email = extra.student_email;
    this.course_id = data.course_id;
    this.course_name = extra.course_name;
    this.course_code = extra.course_code;
    this.teacher_user_id = data.teacher_user_id;
    this.teacher_name = extra.teacher_name;
    this.exam_type = data.exam_type;
    this.grade_value = data.grade_value;
    this.weight = data.weight;
    this.total_grade = data.total_grade || 0;
    this.result_status = data.result_status || null;
     
    this.modified_by = data.modified_by || null; 
    this.modified_by_name = extra.modified_by_name;
    this.modified_at = data.modified_at || null; 
    this.is_deleted = data.is_deleted || false;
    this.created_at = data.created_at;
    this.updated_at = data.updated_at;
  }
}