import {
  IsNotEmpty,
  IsString,
  IsNumber,
  IsEnum,
  IsOptional,
  Min,
  Max,
} from 'class-validator';
import { ExamType } from '../entities/grade.entity';

export class CreateGradeDto {
  @IsNotEmpty({ message: 'معرف الطالب مطلوب' })
  @IsString({ message: 'معرف الطالب يجب أن يكون نصاً' })
  student_user_id: string;

  @IsNotEmpty({ message: 'معرف الدورة مطلوب' })
  @IsString({ message: 'معرف الدورة يجب أن يكون نصاً' })
  course_id: string;

  @IsEnum(ExamType, { message: 'نوع الامتحان غير صحيح' })
  @IsNotEmpty({ message: 'نوع الامتحان مطلوب' })
  exam_type: ExamType;

  @IsNotEmpty({ message: 'الدرجة مطلوبة' })
  @IsNumber({}, { message: 'الدرجة يجب أن تكون رقماً' })
  @Min(0, { message: 'الدرجة يجب أن تكون 0 أو أكثر' })
  @Max(100, { message: 'الدرجة يجب أن لا تتجاوز 100' })
  grade_value: number;

  @IsNotEmpty({ message: 'الوزن مطلوب' })
  @IsNumber({}, { message: 'الوزن يجب أن يكون رقماً' })
  @Min(0, { message: 'الوزن يجب أن يكون 0 أو أكثر' })
  @Max(1, { message: 'الوزن يجب أن لا يتجاوز 1' })
  weight: number;

  
 
}