import { IsNotEmpty, IsString, IsEnum, IsOptional, IsIn } from 'class-validator';
import { NotificationType } from '../entities/notification.entity';

export type NotificationTarget = 'all' | 'students' | 'teachers';

export class CreateNotificationDto {
  @IsOptional()
  @IsString({ message: 'معرف المستخدم يجب أن يكون نصاً' })
  user_id?: string;

  @IsOptional()
  @IsString({ message: 'العنوان يجب أن يكون نصاً' })
  title?: string;

  @IsNotEmpty({ message: 'محتوى الإشعار مطلوب' })
  @IsString({ message: 'المحتوى يجب أن يكون نصاً' })
  message: string;

  @IsOptional()
  @IsEnum(NotificationType, { message: 'نوع الإشعار غير صحيح' })
  type?: NotificationType;

  @IsOptional()
  @IsIn(['all', 'students', 'teachers'], {
    message: 'المستهدف يجب أن يكون all أو students أو teachers',
  })
  target?: NotificationTarget;
}