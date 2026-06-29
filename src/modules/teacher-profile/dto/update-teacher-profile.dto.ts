import { IsOptional, IsEnum, IsDateString } from 'class-validator';
import { TeacherSpecialization } from '../entities/teacher-profile.entity';

export class UpdateTeacherProfileDto {
  @IsOptional()
  @IsEnum(TeacherSpecialization, { message: 'التخصص غير صحيح' })
  specialization?: TeacherSpecialization;

  @IsOptional()
  @IsDateString({}, { message: 'تاريخ التعيين يجب أن يكون تاريخاً صحيحاً' })
  hire_date?: string;
}