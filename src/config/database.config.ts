// import { TypeOrmModuleOptions } from '@nestjs/typeorm';
// import { ConfigService } from '@nestjs/config';
// import { User } from '../modules/users/entities/user.entity';
// import { Course } from '../modules/course/entities/course.entity';
// import { Enrollment } from '../modules/enrollments/entities/enrollment.entity';
// import { Notification } from '../modules/notifications/entities/notification.entity';

// export const getDatabaseConfig = (configService: ConfigService): TypeOrmModuleOptions => {
//   const host = configService.get<string>('DB_HOST', 'localhost');
//   const port = configService.get<number>('DB_PORT', 27017);
//   const dbName = configService.get<string>('DB_NAME', 'institute_db');
//   const user = configService.get<string>('DB_USER');
//   const password = configService.get<string>('DB_PASSWORD');

//   // بناء رابط الاتصال
//   let uri = `mongodb://${host}:${port}`;
  
//   // إذا كان هناك مستخدم وكلمة مرور، أضفهم في الرابط
//   if (user && password) {
//     uri = `mongodb://${user}:${password}@${host}:${port}`;
//   }

//   // إضافة اسم قاعدة البيانات وخيارات إضافية
//   uri = `${uri}/${dbName}?authSource=admin&retryWrites=true&w=majority`;

//   console.log(`🔗 جاري الاتصال بقاعدة البيانات: ${host}:${port}/${dbName}`);

//   return {
//     type: 'mongodb',
//     url: uri,
//     entities: [
//       User,
//       Course,
//       Enrollment,
//       Notification,
//     ],
//     synchronize: true, // ✅ يسمح بإنشاء المجموعات تلقائياً
    
//     logging: configService.get<string>('NODE_ENV') === 'development',
//     retryAttempts: 5,
//     retryDelay: 3000,
//     connectTimeoutMS: 10000,
//     socketTimeoutMS: 45000,
//   };
// };

// export const getJwtConfig = (configService: ConfigService) => ({
//   secret: configService.get<string>('JWT_SECRET', 'super_secret_key_change_this'),
//   signOptions: {
//     expiresIn: configService.get<string>('JWT_EXPIRES_IN', '7d'),
//   },
// });

// export const validateDatabaseConfig = (configService: ConfigService): void => {
//   const required = ['DB_HOST', 'DB_NAME'];
//   const missing = required.filter((key) => !configService.get(key));
  
//   if (missing.length > 0) {
//     console.warn(`⚠️ تحذير: المتغيرات التالية غير محددة: ${missing.join(', ')}`);
//     console.warn('سيتم استخدام القيم الافتراضية');
//   }
// };

// export const getDatabaseConnectionString = (configService: ConfigService): string => {
//   const host = configService.get('DB_HOST', 'localhost');
//   const port = configService.get('DB_PORT', 27017);
//   const dbName = configService.get('DB_NAME', 'institute_db');
//   const user = configService.get('DB_USER');
//   const password = configService.get('DB_PASSWORD');

//   if (user && password) {
//     return `mongodb://${user}:****@${host}:${port}/${dbName}?authSource=admin`;
//   }
//   return `mongodb://${host}:${port}/${dbName}`;
// };

import { TypeOrmModuleOptions } from '@nestjs/typeorm';
import { ConfigService } from '@nestjs/config';
import { User } from '../modules/users/entities/user.entity';
import { Course } from '../modules/course/entities/course.entity';
import { Enrollment } from '../modules/enrollments/entities/enrollment.entity';
import { Notification } from '../modules/notifications/entities/notification.entity';
import { TeacherProfile } from '../modules/teacher-profile/entities/teacher-profile.entity';
import { TeacherAssignment } from '../modules/teacher-assignment/entities/teacher-assignment.entity';
import { Grade } from '../modules/grades/entities/grade.entity';
import { Graduation } from '../modules/graduation/entities/graduation.entity';
import { Student } from '../modules/students/entities/student.entity';

export const getDatabaseConfig = (configService: ConfigService): TypeOrmModuleOptions => {
  // ✅ استخدام MONGO_URL مباشرة
  const mongoUrl = configService.get<string>('MONGO_URL', 'mongodb://localhost:27017/institute_db');

  console.log(`🔗 جاري الاتصال بقاعدة البيانات: ${mongoUrl}`);

  return {
    type: 'mongodb',
    url: mongoUrl,
    entities: [
      User,
      Course,
      Enrollment,
      Notification,
       TeacherProfile,
      TeacherAssignment,
      Grade,
      Graduation,
      Student
    ],
    synchronize: true,   
    logging: configService.get<string>('NODE_ENV') === 'development',
    retryAttempts: 5,
    retryDelay: 3000,
    connectTimeoutMS: 10000,
    socketTimeoutMS: 45000,
  };
};

export const getJwtConfig = (configService: ConfigService) => ({
  secret: configService.get<string>('JWT_SECRET', 'super_secret_key_change_this'),
  signOptions: {
    expiresIn: configService.get<string>('JWT_EXPIRES_IN', '7d'),
  },
});

export const validateDatabaseConfig = (configService: ConfigService): void => {
  const mongoUrl = configService.get<string>('MONGO_URL');
  if (!mongoUrl) {
    console.warn('⚠️ تحذير: MONGO_URL غير محددة، سيتم استخدام القيمة الافتراضية');
  }
};