import {
  Injectable,
  NotFoundException,
  BadRequestException,
  ForbiddenException,
  ConflictException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { MongoRepository } from 'typeorm';
import { ObjectId } from 'mongodb';
import { TeacherProfile, TeacherSpecialization } from './entities/teacher-profile.entity';
import { CreateTeacherProfileDto } from './dto/create-teacher-profile.dto';
import { UpdateTeacherProfileDto } from './dto/update-teacher-profile.dto';
import { TeacherProfileResponseDto } from './dto/teacher-profile-response.dto';
import { User } from '../users/entities/user.entity';
import { NotificationsService } from '../notifications/notifications.service';
import { NotificationType} from '../notifications/entities/notification.entity';

@Injectable()
export class TeacherProfileService {
  constructor(
    @InjectRepository(TeacherProfile)
    private teacherProfileRepository: MongoRepository<TeacherProfile>,
    @InjectRepository(User)
    private userRepository: MongoRepository<User>,
    private notificationsService: NotificationsService,
  ) {}

  /**
   * إنشاء ملف معلم جديد (للمدير فقط)
   */
  async create(
    createTeacherProfileDto: CreateTeacherProfileDto,
    adminId: string,
  ): Promise<TeacherProfileResponseDto> {
    // التحقق من وجود المدير
    const admin = await this.userRepository.findOne({
      where: { _id: new ObjectId(adminId) },
    });
    if (!admin || admin.role !== 'Admin') {
      throw new ForbiddenException('غير مصرح لك بهذه العملية');
    }

    // التحقق من وجود المستخدم
    if (!ObjectId.isValid(createTeacherProfileDto.user_id)) {
      throw new BadRequestException('معرف المستخدم غير صحيح');
    }
    const user = await this.userRepository.findOne({
      where: { _id: new ObjectId(createTeacherProfileDto.user_id) },
    });
    if (!user) {
      throw new NotFoundException('المستخدم غير موجود');
    }
    if (user.role !== 'Teacher') {
      throw new BadRequestException('المستخدم ليس معلم');
    }

    // التحقق من عدم وجود ملف مسبقاً
    const existing = await this.teacherProfileRepository.findOne({
      where: { user_id: createTeacherProfileDto.user_id },
    });
    if (existing) {
      throw new ConflictException('هذا المعلم لديه ملف بالفعل');
    }

    // ✅ إنشاء الملف باستخدام الحقول الجديدة فقط
    const profile = new TeacherProfile();
    profile.user_id = createTeacherProfileDto.user_id;
    profile.specialization = createTeacherProfileDto.specialization;
    profile.hire_date = createTeacherProfileDto.hire_date ? new Date(createTeacherProfileDto.hire_date) : new Date();

    const saved = await this.teacherProfileRepository.save(profile);

    // إرسال إشعار للمدير
    await this.notificationsService.notifyAdmins(
      '👨‍🏫 تم إنشاء ملف معلم جديد',
      NotificationType.SYSTEM,
    );

    return new TeacherProfileResponseDto(saved, {
      user_name: user.full_name,
      user_email: user.email,
    });
  }

  /**
   * الحصول على جميع ملفات المعلمين
   */
  async findAll(): Promise<TeacherProfileResponseDto[]> {
    const profiles = await this.teacherProfileRepository.find({
      order: { hire_date: 'DESC' as any },
    });

    const result: TeacherProfileResponseDto[] = [];
    for (const profile of profiles) {
      const extra: any = {};
      try {
        const user = await this.userRepository.findOne({
          where: { _id: new ObjectId(profile.user_id) },
        });
        if (user) {
          extra.user_name = user.full_name;
          extra.user_email = user.email;
        }
      } catch (e) {}
      result.push(new TeacherProfileResponseDto(profile, extra));
    }

    return result;
  }

  /**
   * الحصول على ملف معلم واحد
   */
  async findOne(id: string): Promise<TeacherProfileResponseDto> {
    if (!ObjectId.isValid(id)) {
      throw new BadRequestException('معرف غير صحيح');
    }

    const profile = await this.teacherProfileRepository.findOne({
      where: { _id: new ObjectId(id) },
    });
    if (!profile) {
      throw new NotFoundException('ملف المعلم غير موجود');
    }

    const extra: any = {};
    try {
      const user = await this.userRepository.findOne({
        where: { _id: new ObjectId(profile.user_id) },
      });
      if (user) {
        extra.user_name = user.full_name;
        extra.user_email = user.email;
      }
    } catch (e) {}

    return new TeacherProfileResponseDto(profile, extra);
  }

  /**
   * الحصول على ملف معلم بواسطة user_id
   */
  async findByUserId(userId: string): Promise<TeacherProfileResponseDto> {
    if (!ObjectId.isValid(userId)) {
      throw new BadRequestException('معرف المستخدم غير صحيح');
    }

    const profile = await this.teacherProfileRepository.findOne({
      where: { user_id: userId },
    });
    if (!profile) {
      throw new NotFoundException('ملف المعلم غير موجود لهذا المستخدم');
    }

    const extra: any = {};
    try {
      const user = await this.userRepository.findOne({
        where: { _id: new ObjectId(userId) },
      });
      if (user) {
        extra.user_name = user.full_name;
        extra.user_email = user.email;
      }
    } catch (e) {}

    return new TeacherProfileResponseDto(profile, extra);
  }

  /**
   * تحديث ملف معلم
   */
  async update(
    id: string,
    updateTeacherProfileDto: UpdateTeacherProfileDto,
    adminId: string,
  ): Promise<TeacherProfileResponseDto> {
    // التحقق من وجود المدير
    const admin = await this.userRepository.findOne({
      where: { _id: new ObjectId(adminId) },
    });
    if (!admin || admin.role !== 'Admin') {
      throw new ForbiddenException('غير مصرح لك بهذه العملية');
    }

    if (!ObjectId.isValid(id)) {
      throw new BadRequestException('معرف غير صحيح');
    }

    const profile = await this.teacherProfileRepository.findOne({
      where: { _id: new ObjectId(id) },
    });
    if (!profile) {
      throw new NotFoundException('ملف المعلم غير موجود');
    }

    // تحديث الحقول
    if (updateTeacherProfileDto.specialization) {
      profile.specialization = updateTeacherProfileDto.specialization;
    }
    if (updateTeacherProfileDto.hire_date) {
      profile.hire_date = new Date(updateTeacherProfileDto.hire_date);
    }

    const updated = await this.teacherProfileRepository.save(profile);

    return this.findOne(updated._id.toString());
  }

  /**
   * حذف ملف معلم
   */
  async delete(id: string, adminId: string): Promise<void> {
    const admin = await this.userRepository.findOne({
      where: { _id: new ObjectId(adminId) },
    });
    if (!admin || admin.role !== 'Admin') {
      throw new ForbiddenException('غير مصرح لك بهذه العملية');
    }

    if (!ObjectId.isValid(id)) {
      throw new BadRequestException('معرف غير صحيح');
    }

    const profile = await this.teacherProfileRepository.findOne({
      where: { _id: new ObjectId(id) },
    });
    if (!profile) {
      throw new NotFoundException('ملف المعلم غير موجود');
    }

    await this.teacherProfileRepository.delete({ _id: new ObjectId(id) });
  }

  /**
   * الحصول على إحصائيات المعلمين
   */
  async getStatistics(): Promise<any> {
    const total = await this.teacherProfileRepository.count();

    // توزيع التخصصات
    const specializations = await this.teacherProfileRepository.find({
      select: ['specialization'],
    });
    const specializationCount: Record<string, number> = {};
    for (const profile of specializations) {
      specializationCount[profile.specialization] = (specializationCount[profile.specialization] || 0) + 1;
    }

    return {
      total,
      specializationDistribution: specializationCount,
    };
  }

  /**
   * الحصول على المعلمين مع ملفاتهم الشخصية
   */
  async getTeachersWithProfiles(): Promise<any[]> {
    const teachers = await this.userRepository.find({
      where: { role: 'Teacher', status: 'Active' },
    });

    const result: any[] = [];
    for (const teacher of teachers) {
      let profile: TeacherProfile | null = null; // ✅ تحديد النوع الصحيح
      try {
        profile = await this.teacherProfileRepository.findOne({
          where: { user_id: teacher._id.toString() },
        });
      } catch (e) {}
      result.push({
        ...teacher,
        profile: profile, // ✅ profile هنا من نوع TeacherProfile | null
      });
    }

    return result;
  }

  /**
   * ✅ الحصول على معلم مع ملفه الشخصي (تم الإصلاح)
   */
  async getTeacherWithProfile(teacherId: string): Promise<any> {
    if (!ObjectId.isValid(teacherId)) {
      throw new BadRequestException('معرف غير صحيح');
    }

    const teacher = await this.userRepository.findOne({
      where: { _id: new ObjectId(teacherId), role: 'Teacher' },
    });
    if (!teacher) {
      throw new NotFoundException('المعلم غير موجود');
    }

    let profile: TeacherProfile | null = null; // ✅ تحديد النوع الصحيح
    try {
      profile = await this.teacherProfileRepository.findOne({
        where: { user_id: teacherId },
      });
    } catch (e) {}

    return {
      ...teacher,
      profile: profile, // ✅ profile هنا من نوع TeacherProfile | null
    };
  }
}