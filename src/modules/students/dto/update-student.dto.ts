import {
  IsOptional,
  IsString,
  IsEnum,
  IsDateString,
} from 'class-validator';
import { EnrollmentStatus, GraduationStatus } from '../entities/student.entity';

export class UpdateStudentDto {
  @IsOptional()
  @IsString({ message: 'رقم الطالب يجب أن يكون نصاً' })
  student_id?: string;

  @IsOptional()
  @IsEnum(EnrollmentStatus, { message: 'حالة التسجيل غير صحيحة' })
  enrollment_status?: EnrollmentStatus;

  @IsOptional()
  @IsEnum(GraduationStatus, { message: 'حالة التخرج غير صحيحة' })
  graduation_status?: GraduationStatus;

  @IsOptional()
  @IsDateString({}, { message: 'تاريخ التسجيل يجب أن يكون تاريخاً صحيحاً' })
  registered_at?: string;
}