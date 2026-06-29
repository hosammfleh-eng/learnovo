import { TeacherSpecialization } from '../entities/teacher-profile.entity';

export class TeacherProfileResponseDto {
  id: string;
  user_id: string;
  user_name?: string;
  user_email?: string;
  specialization: TeacherSpecialization;
  hire_date: Date;

  constructor(data: any, extra: any = {}) {
    this.id = data._id?.toString() || data.id;
    this.user_id = data.user_id;
    this.user_name = extra.user_name;
    this.user_email = extra.user_email;
    this.specialization = data.specialization;
    this.hire_date = data.hire_date;
  }
}