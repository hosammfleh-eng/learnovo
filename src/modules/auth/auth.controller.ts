import { Controller, Post, Body, UseGuards, Request } from '@nestjs/common';
import { AuthService } from './auth.service';
import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';
import { Public } from '../../common/decorators/public.decorator';
import { LocalAuthGuard } from '../../common/guards/local-auth.guard';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { User } from '../../common/decorators/user.decorator';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('register')
  @Public() // لا يحتاج مصادقة
  async register(@Body() registerDto: RegisterDto) {
    return this.authService.register(registerDto);
  }

  @Post('login')
  @Public() // لا يحتاج مصادقة
  @UseGuards(LocalAuthGuard)
  async login(@Body() loginDto: LoginDto) {
    return this.authService.login(loginDto);
  }

  @Post('refresh')
  @Public() // لا يحتاج مصادقة - يستخدم refresh token في الجسم
  async refresh(@Body('refreshToken') refreshToken: string) {
    return this.authService.refresh(refreshToken);
  }

  @Post('logout')
  @UseGuards(JwtAuthGuard)
  async logout(@User('userId') userId: string) {
    // منطق تسجيل الخروج
    return { message: 'تم تسجيل الخروج بنجاح' };
  }

  @Post('verify')
  @UseGuards(JwtAuthGuard)
  async verify(@User() user: any) {
    return {
      user: {
        id: user.userId,
        email: user.email,
        role: user.role,
      },
    };
  }
}
