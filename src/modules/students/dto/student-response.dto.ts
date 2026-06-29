import { EnrollmentStatus, GraduationStatus } from '../entities/student.entity';

export class StudentResponseDto {
  id: string;
  user_id: string;
  student_id: string;
  enrollment_status: EnrollmentStatus;
  graduation_status: GraduationStatus;
  registered_at: Date;

  // بيانات إضافية من User
  user_name?: string;
  user_email?: string;
  user_role?: string;

  constructor(data: any, extra: any = {}) {
    this.id = data._id?.toString() || data.id;
    this.user_id = data.user_id;
    this.student_id = data.student_id;
    this.enrollment_status = data.enrollment_status;
    this.graduation_status = data.graduation_status;
    this.registered_at = data.registered_at;

    this.user_name = extra.user_name;
    this.user_email = extra.user_email;
    this.user_role = extra.user_role;
  }
}