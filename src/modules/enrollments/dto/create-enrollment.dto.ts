import { IsNotEmpty, IsString } from 'class-validator';

export class CreateEnrollmentDto {
  @IsNotEmpty({ message: 'معرف الدورة مطلوب' })
  @IsString({ message: 'معرف الدورة يجب أن يكون نصاً' })
  course_id: string;
}
