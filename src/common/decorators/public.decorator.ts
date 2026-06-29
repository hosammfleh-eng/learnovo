import { SetMetadata } from '@nestjs/common';

export const IS_PUBLIC_KEY = 'isPublic';

/**
 * ديكوراتور لتحديد الواجهة كعامة (لا تحتاج مصادقة)
 * @example
 * @Public()
 * @Post('login')
 * async login() {}
 */
export const Public = () => SetMetadata(IS_PUBLIC_KEY, true);