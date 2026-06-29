import { IsNotEmpty, IsString, IsBoolean, IsOptional } from 'class-validator';

export class AssignTeacherDto {
  @IsNotEmpty({ message: 'معرف الدورة مطلوب' })
  @IsString({ message: 'معرف الدورة يجب أن يكون نصاً' })
  course_id: string;

  @IsNotEmpty({ message: 'معرف المعلم مطلوب' })
  @IsString({ message: 'معرف المعلم يجب أن يكون نصاً' })
  teacher_id: string;

  @IsOptional()
  @IsBoolean({ message: 'can_grade يجب أن يكون قيمة منطقية' })
  can_grade?: boolean;
}