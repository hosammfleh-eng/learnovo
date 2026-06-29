import { IsOptional, IsBoolean } from 'class-validator';

export class UpdateAssignmentDto {
  @IsOptional()
  @IsBoolean({ message: 'is_active يجب أن يكون قيمة منطقية' })
  is_active?: boolean;

  @IsOptional()
  @IsBoolean({ message: 'can_grade يجب أن يكون قيمة منطقية' })
  can_grade?: boolean;
}