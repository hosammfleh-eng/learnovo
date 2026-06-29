import {
  Injectable,
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  UnauthorizedException,
} from '@nestjs/common';

@Injectable()
export class SelfOrAdminGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest();
    const user = request.user;
    const userId = request.params.id;

    if (!user) {
      throw new UnauthorizedException('يجب تسجيل الدخول أولاً');
    }

    const userRole = user.role || user.role;
    const currentUserId = user.userId || user.sub || user.id;

    if (userRole === 'Admin') {
      return true;
    }

    if (currentUserId === userId) {
      return true;
    }

    throw new ForbiddenException('لا يمكنك الوصول إلى بيانات مستخدم آخر');
  }
}