import { SetMetadata } from '@nestjs/common';
import { UserRole } from '../enums/user-role.enum';

export const ROLES_KEY = 'roles';

/**
 * ديكوراتور لتحديد الأدوار المسموح لها بالوصول
 * @example
 * @Roles(UserRole.ADMIN, UserRole.TEACHER)
 * @Get()
 * async findAll() {}
 */
export const Roles = (...roles: UserRole[]) => SetMetadata(ROLES_KEY, roles);