import { IsOptional, IsString, IsEnum, IsBoolean } from 'class-validator';
import { NotificationType } from '../entities/notification.entity';

export class UpdateNotificationDto {
  @IsOptional()
  @IsString({ message: 'المحتوى يجب أن يكون نصاً' })
  message?: string;

  @IsOptional()
  @IsEnum(NotificationType, { message: 'نوع الإشعار غير صحيح' })
  type?: NotificationType;

  @IsOptional()
  @IsBoolean({ message: 'حالة القراءة يجب أن تكون قيمة منطقية' })
  is_read?: boolean;
}