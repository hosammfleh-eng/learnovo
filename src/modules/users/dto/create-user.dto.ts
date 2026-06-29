import {
  IsEmail,
  IsNotEmpty,
  MinLength,
  IsEnum,
  IsOptional,
} from 'class-validator';
import { UserRole, UserStatus } from '../../../common/enums/user-role.enum';

export class CreateUserDto {
  @IsNotEmpty({ message: 'الاسم الكامل مطلوب' })
  full_name: string;

  @IsEmail({}, { message: 'البريد الإلكتروني غير صحيح' })
  @IsNotEmpty({ message: 'البريد الإلكتروني مطلوب' })
  email: string;

  @IsNotEmpty({ message: 'كلمة المرور مطلوبة' })
  @MinLength(6, { message: 'كلمة المرور يجب أن تكون 6 أحرف على الأقل' })
  password_hash: string;

  @IsOptional()
  phone?: string;

  @IsEnum(UserRole, { message: 'الدور غير صحيح' })
  @IsNotEmpty({ message: 'الدور مطلوب' })
  role: UserRole;

  @IsEnum(UserStatus, { message: 'الحالة غير صحيحة' })
  @IsOptional()
  status?: UserStatus;
}
