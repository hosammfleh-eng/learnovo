import {
  IsEmail,
  IsNotEmpty,
  MinLength,
  IsEnum,
  IsOptional,
  ValidateIf,
} from 'class-validator';
import { UserRole } from '../../../common/enums/user-role.enum';

export class RegisterDto {
  @IsOptional()
  @ValidateIf((o) => !o.full_name)
  @IsNotEmpty({ message: 'الاسم الكامل مطلوب' })
  name?: string; // allow frontend 'name' field

  @IsOptional()
  @ValidateIf((o) => !o.name)
  @IsNotEmpty({ message: 'الاسم الكامل مطلوب' })
  full_name?: string;

  @IsEmail({}, { message: 'البريد الإلكتروني غير صحيح' })
  @IsNotEmpty({ message: 'البريد الإلكتروني مطلوب' })
  email: string;

  @IsNotEmpty({ message: 'كلمة المرور مطلوبة' })
  @MinLength(6, { message: 'كلمة المرور يجب أن تكون 6 أحرف على الأقل' })
  password: string;

  @IsOptional()
  @ValidateIf((o) => o.confirmPassword !== undefined)
  @MinLength(6, { message: 'كلمة المرور يجب أن تكون 6 أحرف على الأقل' })
  confirmPassword?: string;

  @IsOptional()
  phone?: string;

  @IsEnum(UserRole, { message: 'الدور غير صحيح' })
  @IsNotEmpty({ message: 'الدور مطلوب' })
  role: UserRole;
}
