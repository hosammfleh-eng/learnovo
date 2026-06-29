import { IsNotEmpty, IsString, IsOptional, IsDateString, IsEnum } from 'class-validator';
import { GraduationStatus } from '../entities/graduation.entity';

export class CreateGraduationDto {
  @IsNotEmpty({ message: 'معرف الطالب مطلوب' })
  @IsString({ message: 'معرف الطالب يجب أن يكون نصاً' })
  student_user_id: string;

  @IsNotEmpty({ message: 'معرف الدورة مطلوب' })
  @IsString({ message: 'معرف الدورة يجب أن يكون نصاً' })
  course_id: string;

  @IsOptional()
  @IsString({ message: 'معرف المعلم يجب أن يكون نصاً' })
  recommendation_by_teacher_id?: string;

  @IsOptional()
  @IsDateString({}, { message: 'تاريخ التوصية يجب أن يكون تاريخاً صحيحاً' })
  recommendation_date?: string;

  @IsOptional()
  @IsEnum(GraduationStatus, { message: 'الحالة غير صحيحة' })
  status?: GraduationStatus;

  @IsOptional()
  @IsString({ message: 'مسار الشهادة يجب أن يكون نصاً' })
  certificate_path?: string;

  @IsOptional()
  @IsDateString({}, { message: 'تاريخ الإصدار يجب أن يكون تاريخاً صحيحاً' })
  issue_date?: string;

  @IsOptional()
  @IsString({ message: 'الملاحظات يجب أن تكون نصاً' })
  notes?: string;
}