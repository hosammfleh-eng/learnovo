import { IsEmail, IsOptional, MinLength, IsEnum, IsString } from 'class-validator';
import { UserRole, UserStatus } from '../../../common/enums/user-role.enum';

export class UpdateUserDto {
  @IsOptional()
  @IsString({ message: 'الاسم الكامل يجب أن يكون نصاً' })
  full_name?: string;

  @IsOptional()
  @IsEmail({}, { message: 'البريد الإلكتروني غير صحيح' })
  email?: string;

  @IsOptional()
  @MinLength(6, { message: 'كلمة المرور يجب أن تكون 6 أحرف على الأقل' })
  password_hash?: string;

  @IsOptional()
  phone?: string;

  @IsOptional()
  @IsEnum(UserRole, { message: 'الدور غير صحيح' })
  role?: UserRole;

  @IsOptional()
  @IsEnum(UserStatus, { message: 'الحالة غير صحيحة' })
  status?: UserStatus;
}