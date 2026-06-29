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
import { Graduation, GraduationStatus } from './entities/graduation.entity';
import { CreateGraduationDto } from './dto/create-graduation.dto';
import { UpdateGraduationDto } from './dto/update-graduation.dto';
import { GraduationResponseDto } from './dto/graduation-response.dto';
import { User } from '../users/entities/user.entity';
import { Course } from '../course/entities/course.entity';
import { NotificationsService } from '../notifications/notifications.service';
import { NotificationType } from '../notifications/entities/notification.entity';

@Injectable()
export class GraduationService {
  constructor(
    @InjectRepository(Graduation)
    private graduationRepository: MongoRepository<Graduation>,
    @InjectRepository(User)
    private userRepository: MongoRepository<User>,
    @InjectRepository(Course)
    private courseRepository: MongoRepository<Course>,
    private notificationsService: NotificationsService,
  ) {}

  /**
   * إنشاء طلب تخرج جديد
   */
  async create(createGraduationDto: CreateGraduationDto, userId: string, userRole: string): Promise<GraduationResponseDto> {
    // التحقق من وجود الطالب
    if (!ObjectId.isValid(createGraduationDto.student_user_id)) {
      throw new BadRequestException('معرف الطالب غير صحيح');
    }
    const student = await this.userRepository.findOne({
      where: { _id: new ObjectId(createGraduationDto.student_user_id) },
    });
    if (!student || student.role !== 'Student') {
      throw new NotFoundException('الطالب غير موجود');
    }

    // التحقق من وجود الدورة
    if (!ObjectId.isValid(createGraduationDto.course_id)) {
      throw new BadRequestException('معرف الدورة غير صحيح');
    }
    const course = await this.courseRepository.findOne({
      where: { _id: new ObjectId(createGraduationDto.course_id) },
    });
    if (!course) {
      throw new NotFoundException('الدورة غير موجودة');
    }

    // التحقق من عدم وجود طلب تخرج مكرر (غير محذوف وغير مرفوض)
    const existing = await this.graduationRepository.findOne({
      where: {
        student_user_id: createGraduationDto.student_user_id,
        course_id: createGraduationDto.course_id,
        is_deleted: false,
        status: { $nin: [GraduationStatus.REJECTED, GraduationStatus.GRADUATED] },
      },
    });
    if (existing) {
      throw new ConflictException('يوجد طلب تخرج لهذا الطالب في هذه الدورة بالفعل');
    }

    // إنشاء طلب التخرج
    const graduation = new Graduation();
    graduation.student_user_id = createGraduationDto.student_user_id;
    graduation.course_id = createGraduationDto.course_id;
    graduation.status = createGraduationDto.status || GraduationStatus.PENDING_RECOMMENDATION;
    graduation.certificate_path = createGraduationDto.certificate_path || null;
    graduation.issue_date = createGraduationDto.issue_date ? new Date(createGraduationDto.issue_date) : null;
    graduation.notes = createGraduationDto.notes || null;
    graduation.recommendation_by_teacher_id = null;
    graduation.recommendation_date = null;
    graduation.approval_by_admin_id = null;
    graduation.approval_date = null;
    graduation.is_deleted = false;
    graduation.created_at = new Date();
    graduation.updated_at = new Date();

    // إذا كان المستخدم معلم، تعيينه كموصي
    if (userRole === 'Teacher') {
      graduation.recommendation_by_teacher_id = userId;
      graduation.recommendation_date = new Date();
      graduation.status = GraduationStatus.RECOMMENDED;
    }

    const saved = await this.graduationRepository.save(graduation);

    // إرسال إشعار للمديرين
    await this.notificationsService.notifyAdmins(
      `🎓 طلب تخرج جديد للطالب "${student.full_name}" في دورة "${course.course_name}"`,
      NotificationType.APPROVAL,
    );

    return this.findOne(saved._id.toString());
  }

  /**
   * الحصول على جميع طلبات التخرج
   */
  async findAll(
    studentId?: string,
    courseId?: string,
    status?: string,
    teacherId?: string,
  ): Promise<GraduationResponseDto[]> {
    const filter: any = { is_deleted: false };

    if (studentId) {
      if (!ObjectId.isValid(studentId)) {
        throw new BadRequestException('معرف الطالب غير صحيح');
      }
      filter.student_user_id = studentId;
    }
    if (courseId) {
      if (!ObjectId.isValid(courseId)) {
        throw new BadRequestException('معرف الدورة غير صحيح');
      }
      filter.course_id = courseId;
    }
    if (status) {
      filter.status = status;
    }
    if (teacherId) {
      if (!ObjectId.isValid(teacherId)) {
        throw new BadRequestException('معرف المعلم غير صحيح');
      }
      filter.recommendation_by_teacher_id = teacherId;
    }

    const graduations = await this.graduationRepository.find({
      where: filter,
      order: { created_at: 'DESC' as any },
    });

    const result: GraduationResponseDto[] = [];
    for (const graduation of graduations) {
      const extra: any = {};

      // جلب بيانات الطالب
      try {
        const student = await this.userRepository.findOne({
          where: { _id: new ObjectId(graduation.student_user_id) },
        });
        if (student) {
          extra.student_name = student.full_name;
          extra.student_email = student.email;
        }
      } catch (e) {}

      // جلب بيانات الدورة
      try {
        const course = await this.courseRepository.findOne({
          where: { _id: new ObjectId(graduation.course_id) },
        });
        if (course) {
          extra.course_name = course.course_name;
          extra.course_code = course.course_code;
        }
      } catch (e) {}

      // جلب بيانات المعلم الموصي
      if (graduation.recommendation_by_teacher_id) {
        try {
          const teacher = await this.userRepository.findOne({
            where: { _id: new ObjectId(graduation.recommendation_by_teacher_id) },
          });
          if (teacher) {
            extra.recommendation_by_teacher_name = teacher.full_name;
          }
        } catch (e) {}
      }

      // جلب بيانات المدير الموافق
      if (graduation.approval_by_admin_id) {
        try {
          const admin = await this.userRepository.findOne({
            where: { _id: new ObjectId(graduation.approval_by_admin_id) },
          });
          if (admin) {
            extra.approval_by_admin_name = admin.full_name;
          }
        } catch (e) {}
      }

      result.push(new GraduationResponseDto(graduation, extra));
    }

    return result;
  }

  /**
   * الحصول على طلب تخرج واحد
   */
  async findOne(id: string): Promise<GraduationResponseDto> {
    if (!ObjectId.isValid(id)) {
      throw new BadRequestException('معرف غير صحيح');
    }

    const graduation = await this.graduationRepository.findOne({
      where: { _id: new ObjectId(id), is_deleted: false },
    });
    if (!graduation) {
      throw new NotFoundException(`طلب التخرج برقم ${id} غير موجود`);
    }

    const extra: any = {};

    try {
      const student = await this.userRepository.findOne({
        where: { _id: new ObjectId(graduation.student_user_id) },
      });
      if (student) {
        extra.student_name = student.full_name;
        extra.student_email = student.email;
      }
    } catch (e) {}

    try {
      const course = await this.courseRepository.findOne({
        where: { _id: new ObjectId(graduation.course_id) },
      });
      if (course) {
        extra.course_name = course.course_name;
        extra.course_code = course.course_code;
      }
    } catch (e) {}

    if (graduation.recommendation_by_teacher_id) {
      try {
        const teacher = await this.userRepository.findOne({
          where: { _id: new ObjectId(graduation.recommendation_by_teacher_id) },
        });
        if (teacher) {
          extra.recommendation_by_teacher_name = teacher.full_name;
        }
      } catch (e) {}
    }

    if (graduation.approval_by_admin_id) {
      try {
        const admin = await this.userRepository.findOne({
          where: { _id: new ObjectId(graduation.approval_by_admin_id) },
        });
        if (admin) {
          extra.approval_by_admin_name = admin.full_name;
        }
      } catch (e) {}
    }

    return new GraduationResponseDto(graduation, extra);
  }

  /**
   * تحديث طلب تخرج
   */
  async update(
    id: string,
    updateGraduationDto: UpdateGraduationDto,
    userId: string,
    userRole: string,
  ): Promise<GraduationResponseDto> {
    if (!ObjectId.isValid(id)) {
      throw new BadRequestException('معرف غير صحيح');
    }

    const graduation = await this.graduationRepository.findOne({
      where: { _id: new ObjectId(id), is_deleted: false },
    });
    if (!graduation) {
      throw new NotFoundException(`طلب التخرج برقم ${id} غير موجود`);
    }

    // الطالب لا يمكنه التعديل
    if (userRole === 'Student') {
      throw new ForbiddenException('الطالب لا يمكنه تعديل طلب التخرج');
    }

    if (updateGraduationDto.student_user_id) {
      const student = await this.userRepository.findOne({
        where: { _id: new ObjectId(updateGraduationDto.student_user_id) },
      });
      if (!student || student.role !== 'Student') {
        throw new NotFoundException('الطالب غير موجود');
      }
      graduation.student_user_id = updateGraduationDto.student_user_id;
    }

    if (updateGraduationDto.course_id) {
      const course = await this.courseRepository.findOne({
        where: { _id: new ObjectId(updateGraduationDto.course_id) },
      });
      if (!course) {
        throw new NotFoundException('الدورة غير موجودة');
      }
      graduation.course_id = updateGraduationDto.course_id;
    }

    if (updateGraduationDto.recommendation_by_teacher_id) {
      const teacher = await this.userRepository.findOne({
        where: { _id: new ObjectId(updateGraduationDto.recommendation_by_teacher_id) },
      });
      if (!teacher || teacher.role !== 'Teacher') {
        throw new NotFoundException('المعلم غير موجود');
      }
      graduation.recommendation_by_teacher_id = updateGraduationDto.recommendation_by_teacher_id;
    }

    if (updateGraduationDto.recommendation_date) {
      graduation.recommendation_date = new Date(updateGraduationDto.recommendation_date);
    }

    if (updateGraduationDto.approval_by_admin_id) {
      const admin = await this.userRepository.findOne({
        where: { _id: new ObjectId(updateGraduationDto.approval_by_admin_id) },
      });
      if (!admin || admin.role !== 'Admin') {
        throw new NotFoundException('المدير غير موجود');
      }
      graduation.approval_by_admin_id = updateGraduationDto.approval_by_admin_id;
    }

    if (updateGraduationDto.approval_date) {
      graduation.approval_date = new Date(updateGraduationDto.approval_date);
    }

    if (updateGraduationDto.status) {
      graduation.status = updateGraduationDto.status;
    }

    if (updateGraduationDto.certificate_path !== undefined) {
      graduation.certificate_path = updateGraduationDto.certificate_path;
    }

    if (updateGraduationDto.issue_date) {
      graduation.issue_date = new Date(updateGraduationDto.issue_date);
    }

    if (updateGraduationDto.notes !== undefined) {
      graduation.notes = updateGraduationDto.notes;
    }

    graduation.updated_at = new Date();

    const updated = await this.graduationRepository.save(graduation);

    return this.findOne(updated._id.toString());
  }

  /**
   * توصية المعلم لطلب التخرج
   */
  async recommendGraduation(id: string, teacherId: string): Promise<GraduationResponseDto> {
    if (!ObjectId.isValid(id)) {
      throw new BadRequestException('معرف غير صحيح');
    }

    const graduation = await this.graduationRepository.findOne({
      where: { _id: new ObjectId(id), is_deleted: false },
    });
    if (!graduation) {
      throw new NotFoundException(`طلب التخرج برقم ${id} غير موجود`);
    }

    if (graduation.status !== GraduationStatus.PENDING_RECOMMENDATION) {
      throw new BadRequestException('لا يمكن التوصية على هذا الطلب');
    }

    graduation.recommendation_by_teacher_id = teacherId;
    graduation.recommendation_date = new Date();
    graduation.status = GraduationStatus.RECOMMENDED;
    graduation.updated_at = new Date();

    const updated = await this.graduationRepository.save(graduation);

    // إرسال إشعار للمديرين
    await this.notificationsService.notifyAdmins(
      `📝 تم توصية الطالب للتخرج في دورة "${graduation.course_id}"`,
      NotificationType.APPROVAL,
    );

    return this.findOne(updated._id.toString());
  }

  /**
   * موافقة المدير على طلب التخرج
   */
  async approveGraduation(
    id: string,
    adminId: string,
    status: 'approved' | 'rejected' | 'graduated',
    certificate_path?: string,
    issue_date?: string,
  ): Promise<GraduationResponseDto> {
    if (!ObjectId.isValid(id)) {
      throw new BadRequestException('معرف غير صحيح');
    }

    const graduation = await this.graduationRepository.findOne({
      where: { _id: new ObjectId(id), is_deleted: false },
    });
    if (!graduation) {
      throw new NotFoundException(`طلب التخرج برقم ${id} غير موجود`);
    }

    if (graduation.status !== GraduationStatus.RECOMMENDED && graduation.status !== GraduationStatus.PENDING_APPROVAL) {
      throw new BadRequestException('لا يمكن الموافقة على هذا الطلب في حالته الحالية');
    }

    graduation.approval_by_admin_id = adminId;
    graduation.approval_date = new Date();

    if (status === 'approved') {
      graduation.status = GraduationStatus.APPROVED;
    } else if (status === 'rejected') {
      graduation.status = GraduationStatus.REJECTED;
    } else if (status === 'graduated') {
      graduation.status = GraduationStatus.GRADUATED;
      graduation.issue_date = issue_date ? new Date(issue_date) : new Date();
      graduation.certificate_path = certificate_path || `/certificates/graduation_${graduation.student_user_id}_${Date.now()}.pdf`;
    }

    graduation.updated_at = new Date();

    const updated = await this.graduationRepository.save(graduation);

    return this.findOne(updated._id.toString());
  }

  /**
   * حذف طلب تخرج (ناعم)
   */
  async softDelete(id: string, userId: string, userRole: string): Promise<void> {
    if (userRole !== 'Admin') {
      throw new ForbiddenException('غير مصرح لك بهذه العملية');
    }

    if (!ObjectId.isValid(id)) {
      throw new BadRequestException('معرف غير صحيح');
    }

    const graduation = await this.graduationRepository.findOne({
      where: { _id: new ObjectId(id), is_deleted: false },
    });
    if (!graduation) {
      throw new NotFoundException(`طلب التخرج برقم ${id} غير موجود`);
    }

    graduation.is_deleted = true;
    graduation.updated_at = new Date();
    await this.graduationRepository.save(graduation);
  }

  /**
   * حذف طلب تخرج (نهائي)
   */
  async hardDelete(id: string, userId: string, userRole: string): Promise<void> {
    if (userRole !== 'Admin') {
      throw new ForbiddenException('غير مصرح لك بهذه العملية');
    }

    if (!ObjectId.isValid(id)) {
      throw new BadRequestException('معرف غير صحيح');
    }

    const graduation = await this.graduationRepository.findOne({
      where: { _id: new ObjectId(id) },
    });
    if (!graduation) {
      throw new NotFoundException(`طلب التخرج برقم ${id} غير موجود`);
    }

    await this.graduationRepository.delete({ _id: new ObjectId(id) });
  }

  /**
   * إحصائيات طلبات التخرج
   */
  async getStatistics(): Promise<any> {
    const total = await this.graduationRepository.count({ where: { is_deleted: false } });

    const statusStats = await this.graduationRepository.find({
      where: { is_deleted: false },
      select: ['status'],
    });
    const statusCount: Record<string, number> = {};
    for (const g of statusStats) {
      statusCount[g.status] = (statusCount[g.status] || 0) + 1;
    }

    return {
      total,
      statusDistribution: statusCount,
    };
  }
}