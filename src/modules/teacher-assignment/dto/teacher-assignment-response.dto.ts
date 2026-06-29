export class TeacherAssignmentResponseDto {
  id: string;
  course_id: string;
  course_name?: string;
  course_code?: string;
  teacher_id: string;
  teacher_name?: string;
  teacher_email?: string;
  assigned_date: Date;
  is_active: boolean;
  can_grade: boolean;
  created_at: Date;
  updated_at: Date;

  constructor(data: any, extra: any = {}) {
    this.id = data._id?.toString() || data.id;
    this.course_id = data.course_id;
    this.course_name = extra.course_name;
    this.course_code = extra.course_code;
    this.teacher_id = data.teacher_id;
    this.teacher_name = extra.teacher_name;
    this.teacher_email = extra.teacher_email;
    this.assigned_date = data.assigned_date;
    this.is_active = data.is_active;
    this.can_grade = data.can_grade;
    this.created_at = data.created_at;
    this.updated_at = data.updated_at;
  }
}