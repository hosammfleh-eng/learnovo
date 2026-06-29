import { IsNotEmpty, IsString, IsEnum, IsOptional, IsDateString } from 'class-validator';
import { TeacherSpecialization } from '../entities/teacher-profile.entity';

export class CreateTeacherProfileDto {
  @IsNotEmpty({ message: 'معرف المستخدم مطلوب' })
  @IsString({ message: 'معرف المستخدم يجب أن يكون نصاً' })
  user_id: string;

  @IsEnum(TeacherSpecialization, { message: 'التخصص غير صحيح' })
  @IsNotEmpty({ message: 'التخصص مطلوب' })
  specialization: TeacherSpecialization;

  @IsOptional()
  @IsDateString({}, { message: 'تاريخ التعيين يجب أن يكون تاريخاً صحيحاً' })
  hire_date?: string;
}