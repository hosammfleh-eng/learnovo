import {
  Injectable,
  ExecutionContext,
  UnauthorizedException,
  HttpStatus,
  CanActivate,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { Observable } from 'rxjs';
import { Reflector } from '@nestjs/core';
import { IS_PUBLIC_KEY } from '../../../common/decorators/public.decorator';

// ✅ استخدام Type بدلاً من Interface
type RequestWithHeaders = {
  headers: {
    authorization?: string;
  };
  url: string;
  user?: {
    userId: string;
    email: string;
    role: string;
    status?: string;
    isActive?: boolean;
    isSuspended?: boolean;
    suspensionReason?: string;
    accountExpiry?: Date;
    permissions?: string[];
  };
};

type AuthError = {
  name: string;
  message: string;
  status?: number;
};

// ✅ تعريف Type للمستخدم الموحد
type ValidatedUser = {
  userId: string;
  email: string;
  role: string;
  status: string;
  isActive: boolean;
  isSuspended: boolean;
  suspensionReason?: string;
  accountExpiry?: Date;
  permissions?: string[];
};

@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {
  constructor(private readonly reflector: Reflector) {
    super();
  }

  /**
   * التحقق من صلاحية الوصول إلى المسار
   */
  canActivate(
    context: ExecutionContext,
  ): boolean | Promise<boolean> | Observable<boolean> {
    const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    if (isPublic) {
      return true;
    }

    const request = context.switchToHttp().getRequest<RequestWithHeaders>();
    const token = this.extractTokenFromHeader(request);

    if (!token) {
      throw new UnauthorizedException({
        statusCode: HttpStatus.UNAUTHORIZED,
        message: 'رمز المصادقة مطلوب',
        error: 'غير مصرح',
        timestamp: new Date().toISOString(),
        path: request.url,
      });
    }

    return super.canActivate(context);
  }

  /**
   * معالجة الأخطاء أثناء التحقق
   */
  handleRequest(
    err: any,
    user: any,
    info: any,
    context: ExecutionContext,
  ): any {
    const request = context.switchToHttp().getRequest<RequestWithHeaders>();

    // إذا كان هناك خطأ في المصادقة
    if (err || !user) {
      let message: string = 'فشلت المصادقة';
      let status: number = HttpStatus.UNAUTHORIZED;

      if (this.isAuthError(info)) {
        const authError = info as AuthError;
        if (authError.name === 'TokenExpiredError') {
          message = 'انتهت صلاحية الرمز';
          status = HttpStatus.UNAUTHORIZED;
        } else if (authError.name === 'JsonWebTokenError') {
          message = 'الرمز غير صحيح';
          status = HttpStatus.UNAUTHORIZED;
        } else if (authError.name === 'NotBeforeError') {
          message = 'الرمز غير نشط بعد';
          status = HttpStatus.UNAUTHORIZED;
        } else if (err) {
          message = err.message || 'فشلت المصادقة';
          status = err?.status || HttpStatus.UNAUTHORIZED;
        }
      } else if (err) {
        message = err.message || 'فشلت المصادقة';
        status = err?.status || HttpStatus.UNAUTHORIZED;
      }

      throw new UnauthorizedException({
        statusCode: status,
        message,
        error: 'غير مصرح',
        timestamp: new Date().toISOString(),
        path: request.url,
        token: this.isAuthError(info) ? (info as AuthError).name : null,
      });
    }

    // ✅ تحويل المستخدم إلى النوع المطلوب
    const userData = this.normalizeUser(user);
    
    // التحقق من أن المستخدم نشط
    if (!userData.isActive) {
      throw new UnauthorizedException({
        statusCode: HttpStatus.FORBIDDEN,
        message: 'الحساب غير مفعّل',
        error: 'ممنوع',
        timestamp: new Date().toISOString(),
        path: request.url,
      });
    }

    // التحقق من أن المستخدم غير معلق
    if (userData.isSuspended) {
      throw new UnauthorizedException({
        statusCode: HttpStatus.FORBIDDEN,
        message: 'الحساب معلق',
        error: 'ممنوع',
        timestamp: new Date().toISOString(),
        path: request.url,
        suspensionReason: userData.suspensionReason || 'لا يوجد سبب محدد',
      });
    }

    // التحقق من صلاحية الحساب
    if (
      userData.accountExpiry &&
      new Date(userData.accountExpiry) < new Date()
    ) {
      throw new UnauthorizedException({
        statusCode: HttpStatus.FORBIDDEN,
        message: 'انتهت صلاحية الحساب',
        error: 'ممنوع',
        timestamp: new Date().toISOString(),
        path: request.url,
        expiryDate: userData.accountExpiry,
      });
    }

    // ✅ إرجاع المستخدم بعد التحقق
    return userData;
  }

  /**
   * ✅ دالة لتطبيع بيانات المستخدم - بدون Interface
   */
  private normalizeUser(user: any): ValidatedUser {
    // التحقق من وجود المستخدم
    if (!user) {
      return {
        userId: '',
        email: '',
        role: 'Student',
        status: 'Inactive',
        isActive: false,
        isSuspended: false,
        permissions: [],
      };
    }

    // استخراج البيانات مع قيم افتراضية
    const userId = user.userId || user.sub || user.id || '';
    const email = user.email || '';
    const role = user.role || 'Student';
    const status = user.status || 'Active';
    const isActive = user.isActive !== undefined ? user.isActive : status === 'Active';
    const isSuspended = user.isSuspended || false;
    const suspensionReason = user.suspensionReason || undefined;
    const accountExpiry = user.accountExpiry || undefined;
    const permissions = user.permissions || [];

    return {
      userId,
      email,
      role,
      status,
      isActive,
      isSuspended,
      suspensionReason,
      accountExpiry,
      permissions,
    };
  }

  /**
   * استخراج التوكن من الـ Header
   */
  private extractTokenFromHeader(request: RequestWithHeaders): string | null {
    const authHeader = request.headers.authorization;
    if (!authHeader) {
      return null;
    }

    const parts = authHeader.split(' ');
    if (parts.length !== 2 || parts[0] !== 'Bearer') {
      return null;
    }

    return parts[1];
  }

  /**
   * Type Guard للتحقق من خطأ المصادقة
   */
  private isAuthError(error: unknown): error is AuthError {
    return (
      error !== null &&
      typeof error === 'object' &&
      'name' in error &&
      typeof (error as AuthError).name === 'string'
    );
  }
}

export default JwtAuthGuard;