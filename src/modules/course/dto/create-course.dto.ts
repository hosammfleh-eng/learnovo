import { IsNotEmpty, IsString, IsNumber, IsOptional, Min, Max, IsDateString, IsEnum } from 'class-validator';
import { CourseStatus } from '../entities/course.entity';

export class CreateCourseDto {
  @IsNotEmpty({ message: 'اسم الدورة مطلوب' })
  @IsString({ message: 'اسم الدورة يجب أن يكون نصاً' })
  course_name: string;

  @IsNotEmpty({ message: 'كود الدورة مطلوب' })
  @IsString({ message: 'كود الدورة يجب أن يكون نصاً' })
  course_code: string;

  @IsOptional()
  @IsString({ message: 'الوصف يجب أن يكون نصاً' })
  description?: string;

  @IsOptional()
  @IsNumber({}, { message: 'عدد الساعات يجب أن يكون رقماً' })
  @Min(1, { message: 'عدد الساعات يجب أن يكون على الأقل 1' })
  @Max(52, { message: 'عدد الساعات يجب أن لا يتجاوز 52' })
  credit_hours?: number;

  @IsOptional()
  @IsNumber({}, { message: 'الحد الأقصى للطلاب يجب أن يكون رقماً' })
  @Min(1, { message: 'الحد الأقصى للطلاب يجب أن يكون على الأقل 1' })
  max_students?: number;

  @IsOptional()
  @IsDateString({}, { message: 'تاريخ البدء يجب أن يكون تاريخاً صحيحاً' })
  start_date?: string;

  @IsOptional()
  @IsDateString({}, { message: 'تاريخ الانتهاء يجب أن يكون تاريخاً صحيحاً' })
  end_date?: string;

  @IsOptional()
  @IsEnum(CourseStatus, { message: 'حالة الدورة غير صحيحة' })
  status?: CourseStatus;
}