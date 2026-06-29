import {
  IsOptional,
  IsString,
  IsNumber,
  IsEnum,
  Min,
  Max,
} from 'class-validator';
import { ExamType } from '../entities/grade.entity';

export class UpdateGradeDto {
  @IsOptional()
  @IsEnum(ExamType, { message: 'نوع الامتحان غير صحيح' })
  exam_type?: ExamType;

  @IsOptional()
  @IsNumber({}, { message: 'الدرجة يجب أن تكون رقماً' })
  @Min(0, { message: 'الدرجة يجب أن تكون 0 أو أكثر' })
  @Max(100, { message: 'الدرجة يجب أن لا تتجاوز 100' })
  grade_value?: number;

  @IsOptional()
  @IsNumber({}, { message: 'الوزن يجب أن يكون رقماً' })
  @Min(0, { message: 'الوزن يجب أن يكون 0 أو أكثر' })
  @Max(1, { message: 'الوزن يجب أن لا يتجاوز 1' })
  weight?: number;

   
}