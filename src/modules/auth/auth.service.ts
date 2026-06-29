import {
  Injectable,
  UnauthorizedException,
  BadRequestException,
  ConflictException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UsersService } from '../users/users.service';
import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';
import { User } from '../users/entities/user.entity';
import { UserStatus } from '../../common/enums/user-role.enum';
import * as bcrypt from 'bcryptjs';

@Injectable()
export class AuthService {
  constructor(
    private usersService: UsersService,
    private jwtService: JwtService,
  ) {}

  /**
   * ✅ التحقق من صحة المستخدم
   */
  async validateUser(email: string, password: string): Promise<User> {
    const user = await this.usersService.findByEmail(email);
    if (!user) {
      throw new UnauthorizedException('البريد الإلكتروني غير موجود');
    }

    const storedPassword = user.password_hash;
    if (!storedPassword) {
      throw new UnauthorizedException('كلمة المرور غير صحيحة');
    }

    let isMatch = false;
    if (typeof storedPassword === 'string' && storedPassword.startsWith('$2')) {
      isMatch = await bcrypt.compare(password, storedPassword);
    } else {
      isMatch = storedPassword === password;
    }

    if (!isMatch) {
      throw new UnauthorizedException('كلمة المرور غير صحيحة');
    }

    if (user.status !== 'Active') {
      throw new UnauthorizedException('الحساب غير مفعّل، يرجى انتظار الموافقة');
    }

    if (
      !user.password_hash ||
      (user.password_hash && !user.password_hash.startsWith('$2'))
    ) {
      const hashed = await bcrypt.hash(password, 10);
      await this.usersService.update(user._id.toString(), {
        password_hash: hashed,
      });
    }

    return user;
  }

  /**
   * ✅ تسجيل الدخول
   */
  async login(loginDto: LoginDto) {
    const user = await this.validateUser(loginDto.email, loginDto.password);

    await this.usersService.updateLastLogin(user._id.toString());

    const payload = {
      sub: user._id.toString(),
      email: user.email,
      role: user.role,
    };

    return {
      access_token: this.jwtService.sign(payload),
      user: {
        id: user._id.toString(),
        full_name: user.full_name,
        email: user.email,
        role: user.role,
        status: user.status,
      },
    };
  }

  /**
   * ✅ تسجيل مستخدم جديد
   */
  async register(registerDto: RegisterDto) {
    const existing = await this.usersService.findByEmail(registerDto.email);
    if (existing) {
      throw new ConflictException('البريد الإلكتروني مستخدم بالفعل');
    }

    const fullName = registerDto.full_name || registerDto.name || '';

    // ✅ تشفير كلمة المرور
    const hashed = await bcrypt.hash(registerDto.password, 10);

    const createPayload = {
      full_name: fullName,
      email: registerDto.email,
      password_hash: hashed,
      phone: registerDto.phone,
      role: registerDto.role,
      status: UserStatus.PENDING,
    };

    const user = await this.usersService.create(createPayload as any);

    return {
      message: 'تم إنشاء الحساب بنجاح، في انتظار موافقة المدير',
      user: {
        id: user.id.toString(),
        full_name: user.full_name,
        email: user.email,
        role: user.role,
        status: user.status,
      },
    };
  }

  /**
   * ✅ تجديد JWT Token باستخدام refresh token
   */
  async refresh(refreshToken: string) {
    if (!refreshToken) {
      throw new BadRequestException('Refresh token مطلوب');
    }

    try {
      const payload = this.jwtService.verify(refreshToken);
      return {
        access_token: this.jwtService.sign({
          sub: payload.sub,
          email: payload.email,
          role: payload.role,
        }),
      };
    } catch (error) {
      throw new UnauthorizedException('Refresh token غير صالح أو منتهي');
    }
  }
}
