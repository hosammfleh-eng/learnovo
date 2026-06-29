import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { GraduationController } from './graduation.controller';
import { GraduationService } from './graduation.service';
import { Graduation } from './entities/graduation.entity';
import { User } from '../users/entities/user.entity';
import { Course } from '../course/entities/course.entity';
import { NotificationsModule } from '../notifications/notifications.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Graduation, User, Course]),
    NotificationsModule,
  ],
  controllers: [GraduationController],
  providers: [GraduationService],
  exports: [GraduationService],
})
export class GraduationModule {}