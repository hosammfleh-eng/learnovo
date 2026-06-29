import {
  Injectable,
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  UnauthorizedException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { PERMISSIONS_KEY } from '../decorators/permissions.decorator';
import { Permission, RolePermissions, hasAllPermissions, hasAnyPermission } from '../../common/enums/permissions.enum';

@Injectable()
export class PermissionsGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    // الحصول على الصلاحيات المطلوبة من الديكوراتور
    const requiredPermissions = this.reflector.getAllAndOverride<Permission[]>(
      PERMISSIONS_KEY,
      [context.getHandler(), context.getClass()],
    );

    // إذا لم يتم تحديد صلاحيات، يسمح للجميع
    if (!requiredPermissions || requiredPermissions.length === 0) {
      return true;
    }

    // الحصول على المستخدم من الطلب
    const request = context.switchToHttp().getRequest();
    const user = request.user;

    if (!user) {
      throw new UnauthorizedException('يجب تسجيل الدخول أولاً');
    }

    // الحصول على دور المستخدم
    const userRole = user.role || user.role;
    
    if (!userRole) {
      throw new ForbiddenException('لا يوجد دور محدد للمستخدم');
    }

    // التحقق من أن المستخدم لديه الصلاحيات المطلوبة
    const userPermissions = RolePermissions[userRole] || [];
    
    // التحقق من وجود جميع الصلاحيات المطلوبة
    const hasAll = requiredPermissions.every((permission) =>
      userPermissions.includes(permission),
    );

    if (!hasAll) {
      throw new ForbiddenException({
        message: 'ليس لديك الصلاحيات الكافية',
        error: 'ممنوع',
        required: requiredPermissions,
        userPermissions: userPermissions,
        role: userRole,
      });
    }

    return true;
  }
}

/**
 * PermissionsGuard مع دعم AnyPermission
 */
@Injectable()
export class AnyPermissionsGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const requiredPermissions = this.reflector.getAllAndOverride<Permission[]>(
      PERMISSIONS_KEY,
      [context.getHandler(), context.getClass()],
    );

    if (!requiredPermissions || requiredPermissions.length === 0) {
      return true;
    }

    const request = context.switchToHttp().getRequest();
    const user = request.user;

    if (!user) {
      throw new UnauthorizedException('يجب تسجيل الدخول أولاً');
    }

    const userRole = user.role || user.role;
    
    if (!userRole) {
      throw new ForbiddenException('لا يوجد دور محدد للمستخدم');
    }

    const userPermissions = RolePermissions[userRole] || [];
    
    // التحقق من وجود أي من الصلاحيات المطلوبة
    const hasAny = requiredPermissions.some((permission) =>
      userPermissions.includes(permission),
    );

    if (!hasAny) {
      throw new ForbiddenException({
        message: 'ليس لديك أي من الصلاحيات المطلوبة',
        error: 'ممنوع',
        required: requiredPermissions,
        userPermissions: userPermissions,
        role: userRole,
      });
    }

    return true;
  }
}