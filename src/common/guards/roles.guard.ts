import {
  Injectable,
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  UnauthorizedException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { ROLES_KEY } from '../decorators/roles.decorator';
import { UserRole } from '../enums/user-role.enum';

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    // الحصول على الأدوار المطلوبة من الديكوراتور
    const requiredRoles = this.reflector.getAllAndOverride<UserRole[]>(
      ROLES_KEY,
      [context.getHandler(), context.getClass()],
    );

    // إذا لم يتم تحديد أدوار، يسمح للجميع
    if (!requiredRoles || requiredRoles.length === 0) {
      return true;
    }

    // الحصول على المستخدم من الطلب
    const { user } = context.switchToHttp().getRequest();

    // إذا لم يكن هناك مستخدم، يمنع الوصول
    if (!user) {
      throw new UnauthorizedException('يجب تسجيل الدخول أولاً');
    }

    // التحقق من وجود دور المستخدم
    if (!user.role) {
      throw new ForbiddenException('لا يوجد دور محدد للمستخدم');
    }

    // التحقق من أن دور المستخدم ضمن الأدوار المسموحة
    const hasRole = requiredRoles.some((role) => user.role === role);

    if (!hasRole) {
      throw new ForbiddenException(
        `ليس لديك الصلاحية الكافية. الأدوار المطلوبة: ${requiredRoles.join(', ')}`,
      );
    }

    return true;
  }
}