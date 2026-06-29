import { CourseStatus } from '../entities/course.entity';

export class CourseResponseDto {
  id: string;
  course_name: string;
  course_code: string;
  description?: string;
  credit_hours: number;
  max_students: number;
  current_students: number;
  start_date: Date | null; 
  end_date: Date | null; 
  status: CourseStatus;
  created_by: string;
  created_by_name?: string;
  created_at: Date;
  updated_at: Date;

  constructor(course: any, extra: any = {}) {
    this.id = course._id?.toString() || course.id;
    this.course_name = course.course_name;
    this.course_code = course.course_code;
    this.description = course.description;
    this.credit_hours = course.credit_hours;
    this.max_students = course.max_students;
    this.current_students = course.current_students;
    this.start_date = course.start_date || null; 
    this.end_date = course.end_date || null; 
    this.status = course.status;
    this.created_by = course.created_by;
    this.created_by_name = extra.created_by_name;
    this.created_at = course.created_at;
    this.updated_at = course.updated_at;
  }
}