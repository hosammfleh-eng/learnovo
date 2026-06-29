import { EnrollmentStatus } from '../entities/enrollment.entity';

export class EnrollmentResponseDto {
  id: string;
  student_id: string;
  student_name?: string;
  student_email?: string;
  course_id: string;
  course_name?: string;
  course_code?: string;
  enrollment_date: Date;
  status: EnrollmentStatus;
  created_at: Date;
  updated_at: Date;

  constructor(enrollment: any, extra: any = {}) {
    this.id = enrollment._id?.toString() || enrollment.id;
    this.student_id = enrollment.student_id;
    this.student_name = extra.student_name;
    this.student_email = extra.student_email;
    this.course_id = enrollment.course_id;
    this.course_name = extra.course_name;
    this.course_code = extra.course_code;
    this.enrollment_date = enrollment.enrollment_date;
    this.status = enrollment.status;
    this.created_at = enrollment.created_at;
    this.updated_at = enrollment.updated_at;
  }
}