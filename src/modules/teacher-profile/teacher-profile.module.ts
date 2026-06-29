import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TeacherProfileController } from './teacher-profile.controller';
import { TeacherProfileService } from './teacher-profile.service';
import { TeacherProfile } from './entities/teacher-profile.entity';
import { User } from '../users/entities/user.entity';
import { NotificationsModule } from '../notifications/notifications.module';

@Module({
  imports: [TypeOrmModule.forFeature([TeacherProfile, User]),
  NotificationsModule
],
  controllers: [TeacherProfileController],
  providers: [TeacherProfileService],
  exports: [TeacherProfileService],
})
export class TeacherProfileModule {}