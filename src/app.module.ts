import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthModule } from './modules/auth/auth.module';
import { UsersModule } from './modules/users/users.module';
import { getDatabaseConfig, validateDatabaseConfig } from './config/database.config';
import { NotificationsModule } from './modules/notifications/notifications.module';
import { EnrollmentsModule } from './modules/enrollments/enrollments.module';
import { CourseModule } from './modules/course/course.module';
import { TeacherProfileModule } from './modules/teacher-profile/teacher-profile.module'; // ✅ إضافة
import { TeacherAssignmentModule } from './modules/teacher-assignment/teacher-assignment.module'
import { GradesModule } from './modules/grades/grades.module';
import { GraduationModule } from './modules/graduation/graduation.module';
import { StudentsModule } from './modules/students/students.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: ['.env', '.env.local'],
    }),
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: (configService: ConfigService) => {
        // التحقق من الإعدادات
        validateDatabaseConfig(configService);
        return getDatabaseConfig(configService);
      },
      inject: [ConfigService],
    }),
    NotificationsModule,
    AuthModule,
    UsersModule,
    EnrollmentsModule,
    CourseModule,
    TeacherProfileModule, 
    TeacherAssignmentModule,
    GradesModule,
    GraduationModule,
    StudentsModule
  ],
})
export class AppModule {}