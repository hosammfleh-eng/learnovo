import { GraduationStatus } from '../entities/graduation.entity';

export class GraduationResponseDto {
  id: string;
  student_user_id: string;
  student_name?: string;
  student_email?: string;
  course_id: string;
  course_name?: string;
  course_code?: string;
  recommendation_by_teacher_id: string | null;
  recommendation_by_teacher_name?: string;
  recommendation_date: Date | null;
  approval_by_admin_id: string | null;
  approval_by_admin_name?: string;
  approval_date: Date | null;
  status: GraduationStatus;
  certificate_path: string | null;
  issue_date: Date | null;
  notes: string | null;
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
    this.recommendation_by_teacher_id = data.recommendation_by_teacher_id || null;
    this.recommendation_by_teacher_name = extra.recommendation_by_teacher_name;
    this.recommendation_date = data.recommendation_date || null;
    this.approval_by_admin_id = data.approval_by_admin_id || null;
    this.approval_by_admin_name = extra.approval_by_admin_name;
    this.approval_date = data.approval_date || null;
    this.status = data.status;
    this.certificate_path = data.certificate_path || null;
    this.issue_date = data.issue_date || null;
    this.notes = data.notes || null;
    this.is_deleted = data.is_deleted || false;
    this.created_at = data.created_at;
    this.updated_at = data.updated_at;
  }
}