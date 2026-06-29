import {
  Controller,
  Get,
  Post,
  Body,
  Put,
  Param,
  Delete,
  UseGuards,
  Query,
} from '@nestjs/common';
import { NotificationsService } from './notifications.service';
import { CreateNotificationDto } from './dto/create-notification.dto';
import { UpdateNotificationDto } from './dto/update-notification.dto';
import { NotificationResponseDto } from './dto/notification-response.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { User } from '../../common/decorators/user.decorator';
import { UserRole } from '../../common/enums/user-role.enum';

@Controller('notifications')
@UseGuards(JwtAuthGuard)
export class NotificationsController {
  constructor(private readonly notificationsService: NotificationsService) {}

  /**
   * POST /api/notifications
   * إنشاء إشعار جديد (للمدير فقط)
   */
  @Post()
  @UseGuards(RolesGuard)
  @Roles(UserRole.ADMIN)
  async create(
    @Body() createNotificationDto: CreateNotificationDto,
  ): Promise<NotificationResponseDto | NotificationResponseDto[]> {
    return this.notificationsService.create(createNotificationDto);
  }

  /**
   * GET /api/notifications
   * قائمة إشعارات المستخدم الحالي
   */
  @Get()
  async findAll(
    @User() user: any,
    @Query('limit') limit?: string,
    @Query('offset') offset?: string,
    @Query('isRead') isRead?: string,
    @Query('type') type?: string,
  ): Promise<{ notifications: NotificationResponseDto[]; total: number }> {
    const isReadBoolean = isRead === 'true' ? true : isRead === 'false' ? false : undefined;
    return this.notificationsService.findAll(
      user.userId,
      limit ? +limit : 50,
      offset ? +offset : 0,
      isReadBoolean,
      type,
    );
  }

  /**
   * GET /api/notifications/unread/count
   * عدد الإشعارات غير المقروءة
   */
  @Get('unread/count')
  async getUnreadCount(@User() user: any): Promise<{ count: number }> {
    return this.notificationsService.getUnreadCount(user.userId);
  }

  /**
   * GET /api/notifications/:id
   * تفاصيل إشعار
   */
  @Get(':id')
  async findOne(@Param('id') id: string, @User() user: any): Promise<NotificationResponseDto> {
    return this.notificationsService.findOne(id, user.userId);
  }

  /**
   * PUT /api/notifications/:id
   * تحديث إشعار
   */
  @Put(':id')
  async update(
    @Param('id') id: string,
    @Body() updateNotificationDto: UpdateNotificationDto,
    @User() user: any,
  ): Promise<NotificationResponseDto> {
    return this.notificationsService.update(id, user.userId, updateNotificationDto);
  }

  /**
   * PUT /api/notifications/:id/read
   * تحديد إشعار كمقروء
   */
  @Put(':id/read')
  async markAsRead(@Param('id') id: string, @User() user: any): Promise<NotificationResponseDto> {
    return this.notificationsService.markAsRead(id, user.userId);
  }

  /**
   * PUT /api/notifications/read-all
   * تحديد جميع الإشعارات كمقروءة
   */
  @Put('read-all')
  async markAllAsRead(@User() user: any): Promise<{ message: string; count: number }> {
    return this.notificationsService.markAllAsRead(user.userId);
  }

  /**
   * DELETE /api/notifications/:id
   * حذف إشعار
   */
  @Delete(':id')
  async remove(@Param('id') id: string, @User() user: any): Promise<{ message: string }> {
    await this.notificationsService.remove(id, user.userId);
    return { message: 'تم حذف الإشعار بنجاح' };
  }

  /**
   * DELETE /api/notifications/read-all
   * حذف جميع الإشعارات المقروءة
   */
  @Delete('read-all')
  async removeAllRead(@User() user: any): Promise<{ message: string; count: number }> {
    return this.notificationsService.removeAllRead(user.userId);
  }

  /**
   * POST /api/notifications/clean
   * تنظيف الإشعارات القديمة (للمدير فقط)
   */
  @Post('clean')
  @UseGuards(RolesGuard)
  @Roles(UserRole.ADMIN)
  async cleanOldNotifications(@Body('days') days?: number): Promise<{ message: string; count: number }> {
    return this.notificationsService.cleanOldNotifications(days || 90);
  }
}