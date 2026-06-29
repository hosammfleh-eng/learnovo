import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { EnrollmentsController } from './enrollments.controller';
import { EnrollmentsService } from './enrollments.service';
import { Enrollment } from './entities/enrollment.entity';
import { User } from '../users/entities/user.entity';
import { Course } from '../course/entities/course.entity';
import { NotificationsModule } from '../notifications/notifications.module';
import { TeacherAssignmentModule } from '../teacher-assignment/teacher-assignment.module';

@Module({
  imports: [TypeOrmModule.forFeature([Enrollment, User, Course]),NotificationsModule, TeacherAssignmentModule],
  controllers: [EnrollmentsController],
  providers: [EnrollmentsService],
  exports: [EnrollmentsService],
})
export class EnrollmentsModule {}