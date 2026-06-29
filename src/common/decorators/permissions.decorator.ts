import { SetMetadata } from '@nestjs/common';
import { Permission } from '../enums/permissions.enum'; // ✅ مسار صحيح

export const PERMISSIONS_KEY = 'permissions';

/**
 * ديكوراتور لتحديد الصلاحيات المطلوبة للوصول إلى المسار
 * يتم استخدامه مع PermissionsGuard
 * 
 * @example
 * @Permissions(Permission.VIEW_USERS, Permission.CREATE_USER)
 * @Post()
 * async create() {}
 * 
 * @example
 * @Permissions(Permission.VIEW_USERS)
 * @Get()
 * async findAll() {}
 */
export const Permissions = (...permissions: Permission[]) =>
  SetMetadata(PERMISSIONS_KEY, permissions);

/**
 * ديكوراتور لتحديد صلاحية واحدة مطلوبة
 * @example
 * @Permission(Permission.VIEW_USERS)
 * @Get()
 * async findAll() {}
 */
export const permission = (permission: Permission) =>
  SetMetadata(PERMISSIONS_KEY, [permission]);

/**
 * ديكوراتور لتحديد أن المسار يتطلب أي من الصلاحيات المحددة
 * @example
 * @AnyPermission(Permission.VIEW_USERS, Permission.VIEW_GRADES)
 * @Get()
 * async findAll() {}
 */
export const AnyPermission = (...permissions: Permission[]) =>
  SetMetadata(PERMISSIONS_KEY, permissions);

/**
 * ديكوراتور لتحديد أن المسار يتطلب جميع الصلاحيات المحددة
 * @example
 * @AllPermissions(Permission.VIEW_USERS, Permission.CREATE_USER)
 * @Post()
 * async create() {}
 */
export const AllPermissions = (...permissions: Permission[]) =>
  SetMetadata(PERMISSIONS_KEY, permissions);