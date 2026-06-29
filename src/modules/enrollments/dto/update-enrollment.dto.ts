import { IsOptional, IsString, IsEnum } from 'class-validator';
import { EnrollmentStatus } from '../entities/enrollment.entity';

export class UpdateEnrollmentDto {
  @IsOptional()
  @IsEnum(EnrollmentStatus, { message: 'الحالة غير صحيحة' })
  status?: EnrollmentStatus;

  @IsOptional()
  @IsString({ message: 'سبب الانسحاب يجب أن يكون نصاً' })
  drop_reason?: string;
}
