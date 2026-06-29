import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UsersController } from './users.controller';
import { UsersService } from './users.service';
import { User } from './entities/user.entity';
import { NotificationsModule } from '../notifications/notifications.module';
import { TeacherProfile } from '../teacher-profile/entities/teacher-profile.entity';

@Module({
  imports: [TypeOrmModule.forFeature([User]),NotificationsModule ],
  controllers: [UsersController],
  providers: [UsersService],
  exports: [UsersService],
})
export class UsersModule {}