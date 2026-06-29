import { createParamDecorator, ExecutionContext, UnauthorizedException } from '@nestjs/common';

/**
 * ديكوراتور للحصول على بيانات المستخدم الحالي مع التحقق من وجوده
 * يرمي استثناء إذا لم يكن المستخدم مسجلاً دخول
 * 
 * @example
 * @Get('profile')
 * @UseGuards(JwtAuthGuard)
 * async getProfile(@User() user: any) {
 *   return user;
 * }
 * 
 * @example
 * @Get('profile/email')
 * @UseGuards(JwtAuthGuard)
 * async getEmail(@User('email') email: string) {
 *   return { email };
 * }
 */
export const User = createParamDecorator(
  (data: string | undefined, ctx: ExecutionContext) => {
    const request = ctx.switchToHttp().getRequest();
    const user = request.user;

    if (!user) {
      throw new UnauthorizedException('يجب تسجيل الدخول أولاً');
    }

    // إذا تم تمرير مفتاح، نرجع قيمة محددة من المستخدم
    if (data) {
      const value = user[data];
      if (value === undefined) {
        throw new UnauthorizedException(`الحقل ${data} غير موجود في بيانات المستخدم`);
      }
      return value;
    }

    return user;
  },
);

/**
 * ديكوراتور للحصول على المستخدم الحالي من الطلب (بدون التحقق من وجوده)
 * يستخدم بعد التحقق من JWT في الـ Guards
 * 
 * @example
 * @Get('profile')
 * @UseGuards(JwtAuthGuard)
 * async getProfile(@CurrentUser() user: any) {
 *   return user;
 * }
 * 
 * @example
 * @Get('profile/email')
 * @UseGuards(JwtAuthGuard)
 * async getEmail(@CurrentUser('email') email: string) {
 *   return { email };
 * }
 */
export const CurrentUser = createParamDecorator(
  (data: string | undefined, ctx: ExecutionContext) => {
    const request = ctx.switchToHttp().getRequest();
    const user = request.user;

    // إذا تم تمرير مفتاح، نرجع قيمة محددة من المستخدم
    if (data) {
      return user?.[data];
    }

    return user;
  },
);