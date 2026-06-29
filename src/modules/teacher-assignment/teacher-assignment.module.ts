import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TeacherAssignmentController } from './teacher-assignment.controller';
import { TeacherAssignmentService } from './teacher-assignment.service';
import { TeacherAssignment } from './entities/teacher-assignment.entity';
import { Course } from '../course/entities/course.entity';
import { User } from '../users/entities/user.entity';
import { NotificationsModule } from '../notifications/notifications.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([TeacherAssignment, Course, User]),
    NotificationsModule,
  ],
  controllers: [TeacherAssignmentController],
  providers: [TeacherAssignmentService],
  exports: [TeacherAssignmentService],
})
export class TeacherAssignmentModule {}