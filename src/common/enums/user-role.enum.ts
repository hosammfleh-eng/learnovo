export enum UserRole {
  ADMIN = 'Admin',
  TEACHER = 'Teacher',
  STUDENT = 'Student',
}

export enum UserStatus {
  PENDING = 'Pending',
  ACTIVE = 'Active',
  REJECTED = 'Rejected',
  SUSPENDED = 'Suspended',
}


//   // إدارة المستخدمين
//   VIEW_USERS = 'view_users',
//   CREATE_USER = 'create_user',
//   UPDATE_USER = 'update_user',
//   DELETE_USER = 'delete_user',
//   APPROVE_USER = 'approve_user',

//   // إدارة الدورات
//   VIEW_COURSES = 'view_courses',
//   CREATE_COURSE = 'create_course',
//   UPDATE_COURSE = 'update_course',
//   DELETE_COURSE = 'delete_course',
//   APPROVE_COURSE = 'approve_course',

//   // إدارة التسجيلات
//   VIEW_ENROLLMENTS = 'view_enrollments',
//   CREATE_ENROLLMENT = 'create_enrollment',
//   UPDATE_ENROLLMENT = 'update_enrollment',
//   DELETE_ENROLLMENT = 'delete_enrollment',
//   APPROVE_ENROLLMENT = 'approve_enrollment',

//   // إدارة العلامات
//   VIEW_GRADES = 'view_grades',
//   CREATE_GRADE = 'create_grade',
//   UPDATE_GRADE = 'update_grade',
//   DELETE_GRADE = 'delete_grade',

//   // إدارة الإشعارات
//   VIEW_NOTIFICATIONS = 'view_notifications',
//   CREATE_NOTIFICATION = 'create_notification',
//   DELETE_NOTIFICATION = 'delete_notification',
// }

// // صلاحيات كل دور
// export const RolePermissions = {
//   [UserRole.ADMIN]: [
//     Permission.VIEW_USERS,
//     Permission.CREATE_USER,
//     Permission.UPDATE_USER,
//     Permission.DELETE_USER,
//     Permission.APPROVE_USER,
//     Permission.VIEW_COURSES,
//     Permission.CREATE_COURSE,
//     Permission.UPDATE_COURSE,
//     Permission.DELETE_COURSE,
//     Permission.APPROVE_COURSE,
//     Permission.VIEW_ENROLLMENTS,
//     Permission.CREATE_ENROLLMENT,
//     Permission.UPDATE_ENROLLMENT,
//     Permission.DELETE_ENROLLMENT,
//     Permission.APPROVE_ENROLLMENT,
//     Permission.VIEW_GRADES,
//     Permission.CREATE_GRADE,
//     Permission.UPDATE_GRADE,
//     Permission.DELETE_GRADE,
//     Permission.VIEW_NOTIFICATIONS,
//     Permission.CREATE_NOTIFICATION,
//     Permission.DELETE_NOTIFICATION,
//   ],
//   [UserRole.TEACHER]: [
//     Permission.VIEW_COURSES,
//     Permission.VIEW_ENROLLMENTS,
//     Permission.VIEW_GRADES,
//     Permission.CREATE_GRADE,
//     Permission.UPDATE_GRADE,
//     Permission.DELETE_GRADE,
//     Permission.VIEW_NOTIFICATIONS,
//   ],
//   [UserRole.STUDENT]: [
//     Permission.VIEW_COURSES,
//     Permission.VIEW_ENROLLMENTS,
//     Permission.CREATE_ENROLLMENT,
//     Permission.VIEW_GRADES,
//     Permission.VIEW_NOTIFICATIONS,
//   ],
// };