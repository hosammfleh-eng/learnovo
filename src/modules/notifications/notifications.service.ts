import {
  Injectable,
  NotFoundException,
  BadRequestException,
  ForbiddenException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { MongoRepository } from 'typeorm';
import { ObjectId } from 'mongodb';
import { Notification, NotificationType } from './entities/notification.entity';
import { CreateNotificationDto, NotificationTarget } from './dto/create-notification.dto';
import { UpdateNotificationDto } from './dto/update-notification.dto';
import { NotificationResponseDto } from './dto/notification-response.dto';
import { User } from '../users/entities/user.entity';

@Injectable()
export class NotificationsService {
  constructor(
    @InjectRepository(Notification)
    private notificationRepository: MongoRepository<Notification>,
    @InjectRepository(User)
    private userRepository: MongoRepository<User>,
  ) {}

/**
     * إنشاء إشعار جديد
     */
  async create(
    createNotificationDto: CreateNotificationDto,
  ): Promise<NotificationResponseDto | NotificationResponseDto[]> {
    const { user_id, target, message, title, type } = createNotificationDto;

    if (target) {
      const userIds = await this.getRecipientIdsByTarget(target);
      if (userIds.length === 0) {
        throw new NotFoundException(`لم يتم العثور على مستخدمين للمستهدف "${target}"`);
      }
      return this.createBulk(userIds, message, type || NotificationType.SYSTEM, title);
    }

    if (!user_id) {
      throw new BadRequestException('user_id أو target مطلوب');
    }
    if (!ObjectId.isValid(user_id)) {
      throw new BadRequestException('معرف المستخدم غير صحيح');
    }

    const user = await this.userRepository.findOne({
      where: { _id: new ObjectId(user_id) },
    });
    if (!user) {
      throw new NotFoundException('المستخدم غير موجود');
    }

    const notification = new Notification();
    notification.user_id = user_id;
    notification.title = title;
    notification.message = message;
    notification.type = type || NotificationType.GENERAL;
    notification.is_read = false;
    notification.created_at = new Date();

    const saved = await this.notificationRepository.save(notification);
    return new NotificationResponseDto(saved);
  }

  /**
   * إنشاء إشعارات متعددة لمستخدمين مختلفين
   */
  async createBulk(
    userIds: string[],
    message: string,
    type: NotificationType = NotificationType.GENERAL,
    title?: string,
  ): Promise<NotificationResponseDto[]> {
    const notifications: NotificationResponseDto[] = [];

    for (const userId of userIds) {
      if (!ObjectId.isValid(userId)) continue;

      const user = await this.userRepository.findOne({
        where: { _id: new ObjectId(userId) },
      });
      if (!user) continue;

      const notification = new Notification();
      notification.user_id = userId;
      notification.title = title ;
      notification.message = message;
      notification.type = type;
      notification.is_read = false;
      notification.created_at = new Date();

      const saved = await this.notificationRepository.save(notification);
      notifications.push(new NotificationResponseDto(saved));
    }

    return notifications;
  }

  private async getRecipientIdsByTarget(
    target: 'all' | 'students' | 'teachers',
  ): Promise<string[]> {
    const filter: any = { status: 'Active' };
    if (target === 'students') {
      filter.role = 'Student';
    } else if (target === 'teachers') {
      filter.role = 'Teacher';
    }

    const users = await this.userRepository.find({ where: filter });
    return users.map((user) => user._id.toString());
  }

  /**
   * إرسال إشعار لجميع المديرين
   */
  async notifyAdmins(
    message: string,
    type: NotificationType = NotificationType.SYSTEM,
  ): Promise<NotificationResponseDto[]> {
    const admins = await this.userRepository.find({
      where: { role: 'Admin', status: 'Active' },
    });

    const adminIds = admins.map((admin) => admin._id.toString());
    return this.createBulk(adminIds, message, type);
  }

  /**
   * إرسال إشعار لجميع المعلمين
   */
  async notifyTeachers(
    message: string,
    type: NotificationType = NotificationType.SYSTEM,
  ): Promise<NotificationResponseDto[]> {
    const teachers = await this.userRepository.find({
      where: { role: 'Teacher', status: 'Active' },
    });

    const teacherIds = teachers.map((teacher) => teacher._id.toString());
    return this.createBulk(teacherIds, message, type);
  }

  /**
   * الحصول على إشعارات المستخدم
   */
  async findAll(
    userId: string,
    limit: number = 50,
    offset: number = 0,
    isRead?: boolean,
    type?: string,
  ): Promise<{ notifications: NotificationResponseDto[]; total: number }> {
    if (!ObjectId.isValid(userId)) {
      throw new BadRequestException('معرف المستخدم غير صحيح');
    }

    const filter: any = { user_id: userId };

    if (isRead !== undefined) {
      filter.is_read = isRead;
    }

    if (type) {
      filter.type = type;
    }

    const [notifications, total] = await this.notificationRepository.findAndCount({
      where: filter,
      order: { created_at: 'DESC' as any },
      skip: offset,
      take: limit,
    });

    const result: NotificationResponseDto[] = [];
    for (const notification of notifications) {
      result.push(new NotificationResponseDto(notification));
    }

    return {
      notifications: result,
      total,
    };
  }

  /**
   * الحصول على إشعار واحد
   */
  async findOne(id: string, userId: string): Promise<NotificationResponseDto> {
    if (!ObjectId.isValid(id)) {
      throw new BadRequestException('معرف الإشعار غير صحيح');
    }

    const notification = await this.notificationRepository.findOne({
      where: { _id: new ObjectId(id) },
    });

    if (!notification) {
      throw new NotFoundException(`الإشعار برقم ${id} غير موجود`);
    }

    // التحقق من أن الإشعار يعود للمستخدم
    if (notification.user_id !== userId) {
      throw new ForbiddenException('لا يمكنك عرض إشعار غير خاص بك');
    }

    return new NotificationResponseDto(notification);
  }

  /**
   * تحديث إشعار
   */
  async update(
    id: string,
    userId: string,
    updateNotificationDto: UpdateNotificationDto,
  ): Promise<NotificationResponseDto> {
    if (!ObjectId.isValid(id)) {
      throw new BadRequestException('معرف الإشعار غير صحيح');
    }

    const notification = await this.notificationRepository.findOne({
      where: { _id: new ObjectId(id) },
    });

    if (!notification) {
      throw new NotFoundException(`الإشعار برقم ${id} غير موجود`);
    }

    // التحقق من أن الإشعار يعود للمستخدم
    if (notification.user_id !== userId) {
      throw new ForbiddenException('لا يمكنك تعديل إشعار غير خاص بك');
    }

    if (updateNotificationDto.message !== undefined) {
      notification.message = updateNotificationDto.message;
    }
    if (updateNotificationDto.type !== undefined) {
      notification.type = updateNotificationDto.type;
    }
    if (updateNotificationDto.is_read !== undefined) {
      notification.is_read = updateNotificationDto.is_read;
    }

    const updated = await this.notificationRepository.save(notification);
    return new NotificationResponseDto(updated);
  }

  /**
   * تحديد إشعار كمقروء
   */
  async markAsRead(id: string, userId: string): Promise<NotificationResponseDto> {
    return this.update(id, userId, { is_read: true });
  }

  /**
   * تحديد جميع الإشعارات كمقروءة
   */
  async markAllAsRead(userId: string): Promise<{ message: string; count: number }> {
    if (!ObjectId.isValid(userId)) {
      throw new BadRequestException('معرف المستخدم غير صحيح');
    }

    const result = await this.notificationRepository.updateMany(
      { user_id: userId, is_read: false },
      { $set: { is_read: true } },
    );

    return {
      message: 'تم تحديث جميع الإشعارات كمقروءة',
      count: result.modifiedCount || 0,
    };
  }

  /**
   * الحصول على عدد الإشعارات غير المقروءة
   */
  async getUnreadCount(userId: string): Promise<{ count: number }> {
    if (!ObjectId.isValid(userId)) {
      throw new BadRequestException('معرف المستخدم غير صحيح');
    }

    const count = await this.notificationRepository.count({
      where: { user_id: userId, is_read: false },
    });

    return { count };
  }

  /**
   * حذف إشعار
   */
  async remove(id: string, userId: string): Promise<void> {
    if (!ObjectId.isValid(id)) {
      throw new BadRequestException('معرف الإشعار غير صحيح');
    }

    const notification = await this.notificationRepository.findOne({
      where: { _id: new ObjectId(id) },
    });

    if (!notification) {
      throw new NotFoundException(`الإشعار برقم ${id} غير موجود`);
    }

    // التحقق من أن الإشعار يعود للمستخدم
    if (notification.user_id !== userId) {
      throw new ForbiddenException('لا يمكنك حذف إشعار غير خاص بك');
    }

    await this.notificationRepository.delete({ _id: new ObjectId(id) });
  }

  /**
   * حذف جميع الإشعارات المقروءة لمستخدم
   */
  async removeAllRead(userId: string): Promise<{ message: string; count: number }> {
    if (!ObjectId.isValid(userId)) {
      throw new BadRequestException('معرف المستخدم غير صحيح');
    }

    const result = await this.notificationRepository.deleteMany({
      user_id: userId,
      is_read: true,
    });

    return {
      message: 'تم حذف جميع الإشعارات المقروءة',
      count: result.deletedCount || 0,
    };
  }

  /**
   * حذف إشعارات قديمة (أكثر من عدد معين من الأيام)
   */
  async cleanOldNotifications(days: number = 90): Promise<{ message: string; count: number }> {
    const date = new Date();
    date.setDate(date.getDate() - days);

    const result = await this.notificationRepository.deleteMany({
      is_read: true,
      created_at: { $lt: date } as any,
    });

    return {
      message: `تم حذف الإشعارات المقروءة الأقدم من ${days} يوماً`,
      count: result.deletedCount || 0,
    };
  }

  /**
   * إرسال إشعار عند تغيير حالة تسجيل
   */
  async notifyEnrollmentStatus(
    studentId: string,
    courseName: string,
    status: 'Approved' | 'Rejected' | 'Pending',
  ): Promise<NotificationResponseDto> {
    let message = '';

    switch (status) {
      case 'Approved':
        message = `✅ تم قبول طلب التسجيل في دورة "${courseName}"`;
        break;
      case 'Rejected':
        message = `❌ تم رفض طلب التسجيل في دورة "${courseName}"`;
        break;
      case 'Pending':
        message = `⏳ تم تقديم طلب تسجيل في دورة "${courseName}"، في انتظار الموافقة`;
        break;
    }

    return this.create({
      user_id: studentId,
      message,
      type: NotificationType.ENROLLMENT,
    }) as unknown as NotificationResponseDto;
  }

  /**
   * إرسال إشعار عند إدخال علامة جديدة
   */
  async notifyGradeEntered(
    studentId: string,
    courseName: string,
    examType: string,
    score: number,
  ): Promise<NotificationResponseDto> {
    return this.create({
      user_id: studentId,
      message: `📊 تم إدخال علامة "${examType}" في دورة "${courseName}" بنسبة ${score}%`,
      type: NotificationType.GRADE,
    }) as unknown as NotificationResponseDto;
  }

  /**
   * إرسال إشعار عند الموافقة على حساب
   */
  async notifyAccountApproval(
    userId: string,
    status: 'Active' | 'Rejected' | 'Suspended',
  ): Promise<NotificationResponseDto> {
    let message = '';

    switch (status) {
      case 'Active':
        message = '✅ تم تفعيل حسابك في المعهد، يمكنك الآن تسجيل الدخول';
        break;
      case 'Rejected':
        message = '❌ نأسف لإبلاغك أنه تم رفض طلب التسجيل الخاص بك';
        break;
      case 'Suspended':
        message = '⛔ تم تعليق حسابك، يرجى التواصل مع الإدارة للمزيد من المعلومات';
        break;
    }

    return this.create({
      user_id: userId,
      message,
      type: NotificationType.APPROVAL,
    }) as unknown as NotificationResponseDto;
  }
}