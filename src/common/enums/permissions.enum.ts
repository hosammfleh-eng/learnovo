/**
 * قائمة الصلاحيات المتاحة في النظام
 */
export enum Permission {
  // ===== إدارة المستخدمين =====
  /** عرض قائمة المستخدمين */
  VIEW_USERS = 'view_users',
  /** إنشاء مستخدم جديد */
  CREATE_USER = 'create_user',
  /** تحديث بيانات مستخدم */
  UPDATE_USER = 'update_user',
  /** حذف مستخدم */
  DELETE_USER = 'delete_user',
  /** الموافقة على حساب مستخدم */
  APPROVE_USER = 'approve_user',
  /** تعليق حساب مستخدم */
  SUSPEND_USER = 'suspend_user',
  /** إلغاء تعليق حساب مستخدم */
  UNSUSPEND_USER = 'unsuspend_user',

  // ===== إدارة الدورات =====
  /** عرض قائمة الدورات */
  VIEW_COURSES = 'view_courses',
  /** إنشاء دورة جديدة */
  CREATE_COURSE = 'create_course',
  /** تحديث بيانات دورة */
  UPDATE_COURSE = 'update_course',
  /** حذف دورة */
  DELETE_COURSE = 'delete_course',
  /** الموافقة على دورة */
  APPROVE_COURSE = 'approve_course',
  /** إسناد معلم لدورة */
  ASSIGN_TEACHER = 'assign_teacher',
  /** إلغاء إسناد معلم من دورة */
  UNASSIGN_TEACHER = 'unassign_teacher',

  // ===== إدارة التسجيلات =====
  /** عرض قائمة التسجيلات */
  VIEW_ENROLLMENTS = 'view_enrollments',
  /** إنشاء تسجيل جديد */
  CREATE_ENROLLMENT = 'create_enrollment',
  /** تحديث بيانات تسجيل */
  UPDATE_ENROLLMENT = 'update_enrollment',
  /** حذف تسجيل */
  DELETE_ENROLLMENT = 'delete_enrollment',
  /** الموافقة على تسجيل */
  APPROVE_ENROLLMENT = 'approve_enrollment',
  /** رفض تسجيل */
  REJECT_ENROLLMENT = 'reject_enrollment',

  // ===== إدارة العلامات =====
  /** عرض العلامات */
  VIEW_GRADES = 'view_grades',
  /** إنشاء علامة جديدة */
  CREATE_GRADE = 'create_grade',
  /** تحديث علامة */
  UPDATE_GRADE = 'update_grade',
  /** حذف علامة */
  DELETE_GRADE = 'delete_grade',
  /** عرض جميع العلامات (للمدير) */
  VIEW_ALL_GRADES = 'view_all_grades',

  // ===== إدارة الإشعارات =====
  /** عرض الإشعارات */
  VIEW_NOTIFICATIONS = 'view_notifications',
  /** إنشاء إشعار جديد */
  CREATE_NOTIFICATION = 'create_notification',
  /** حذف إشعار */
  DELETE_NOTIFICATION = 'delete_notification',
  /** إرسال إشعار جماعي */
  SEND_BULK_NOTIFICATION = 'send_bulk_notification',

  // ===== التقارير =====
  /** عرض التقارير */
  VIEW_REPORTS = 'view_reports',
  /** تصدير التقارير */
  EXPORT_REPORTS = 'export_reports',

  // ===== إعدادات النظام =====
  /** عرض إعدادات النظام */
  VIEW_SETTINGS = 'view_settings',
  /** تحديث إعدادات النظام */
  UPDATE_SETTINGS = 'update_settings',
  /** عرض سجل النظام */
  VIEW_LOGS = 'view_logs',
}

/**
 * تعريف الصلاحيات لكل دور
 */
export const RolePermissions: Record<string, Permission[]> = {
  // ===== المدير =====
  Admin: [
    // إدارة المستخدمين
    Permission.VIEW_USERS,
    Permission.CREATE_USER,
    Permission.UPDATE_USER,
    Permission.DELETE_USER,
    Permission.APPROVE_USER,
    Permission.SUSPEND_USER,
    Permission.UNSUSPEND_USER,

    // إدارة الدورات
    Permission.VIEW_COURSES,
    Permission.CREATE_COURSE,
    Permission.UPDATE_COURSE,
    Permission.DELETE_COURSE,
    Permission.APPROVE_COURSE,
    Permission.ASSIGN_TEACHER,
    Permission.UNASSIGN_TEACHER,

    // إدارة التسجيلات
    Permission.VIEW_ENROLLMENTS,
    Permission.CREATE_ENROLLMENT,
    Permission.UPDATE_ENROLLMENT,
    Permission.DELETE_ENROLLMENT,
    Permission.APPROVE_ENROLLMENT,
    Permission.REJECT_ENROLLMENT,

    // إدارة العلامات
    Permission.VIEW_GRADES,
    Permission.CREATE_GRADE,
    Permission.UPDATE_GRADE,
    Permission.DELETE_GRADE,
    Permission.VIEW_ALL_GRADES,

    // إدارة الإشعارات
    Permission.VIEW_NOTIFICATIONS,
    Permission.CREATE_NOTIFICATION,
    Permission.DELETE_NOTIFICATION,
    Permission.SEND_BULK_NOTIFICATION,

    // التقارير
    Permission.VIEW_REPORTS,
    Permission.EXPORT_REPORTS,

    // إعدادات النظام
    Permission.VIEW_SETTINGS,
    Permission.UPDATE_SETTINGS,
    Permission.VIEW_LOGS,
  ],

  // ===== المعلم =====
  Teacher: [
    // إدارة الدورات
    Permission.VIEW_COURSES,

    // إدارة التسجيلات
    Permission.VIEW_ENROLLMENTS,

    // إدارة العلامات
    Permission.VIEW_GRADES,
    Permission.CREATE_GRADE,
    Permission.UPDATE_GRADE,
    Permission.DELETE_GRADE,

    // إدارة الإشعارات
    Permission.VIEW_NOTIFICATIONS,

    // التقارير
    Permission.VIEW_REPORTS,
  ],

  // ===== الطالب =====
  Student: [
    // إدارة الدورات
    Permission.VIEW_COURSES,

    // إدارة التسجيلات
    Permission.VIEW_ENROLLMENTS,
    Permission.CREATE_ENROLLMENT,

    // إدارة العلامات
    Permission.VIEW_GRADES,

    // إدارة الإشعارات
    Permission.VIEW_NOTIFICATIONS,
  ],
};

/**
 * التحقق مما إذا كان المستخدم لديه صلاحية معينة
 */
export function hasPermission(
  userRole: string,
  permission: Permission,
): boolean {
  const permissions = RolePermissions[userRole] || [];
  return permissions.includes(permission);
}

/**
 * التحقق مما إذا كان المستخدم لديه جميع الصلاحيات المطلوبة
 */
export function hasAllPermissions(
  userRole: string,
  permissions: Permission[],
): boolean {
  const userPermissions = RolePermissions[userRole] || [];
  return permissions.every((p) => userPermissions.includes(p));
}

/**
 * التحقق مما إذا كان المستخدم لديه أي من الصلاحيات المطلوبة
 */
export function hasAnyPermission(
  userRole: string,
  permissions: Permission[],
): boolean {
  const userPermissions = RolePermissions[userRole] || [];
  return permissions.some((p) => userPermissions.includes(p));
}