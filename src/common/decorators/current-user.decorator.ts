import { createParamDecorator, ExecutionContext } from '@nestjs/common';

/**
 * ديكوراتور للحصول على المستخدم الحالي من الطلب
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