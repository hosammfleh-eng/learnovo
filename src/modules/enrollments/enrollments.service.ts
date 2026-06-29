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
import { Enrollment, EnrollmentStatus } from './entities/enrollment.entity';
import { CreateEnrollmentDto } from './dto/create-enrollment.dto';
import { UpdateEnrollmentDto } from './dto/update-enrollment.dto';
import { EnrollmentResponseDto } from './dto/enrollment-response.dto';
import { User } from '../users/entities/user.entity';
import { Course } from '../course/entities/course.entity';
import { NotificationsService } from '../notifications/notifications.service';
import { NotificationType } from '../notifications/entities/notification.entity';
import { TeacherAssignmentService } from '../teacher-assignment/teacher-assignment.service';

@Injectable()
export class EnrollmentsService {
  constructor(
    @InjectRepository(Enrollment)
    private enrollmentRepository: MongoRepository<Enrollment>,
    @InjectRepository(User)
    private userRepository: MongoRepository<User>,
    @InjectRepository(Course)
    private courseRepository: MongoRepository<Course>,
    private notificationsService: NotificationsService,
    private teacherAssignmentService: TeacherAssignmentService,
  ) {}

  /**
   * إنشاء طلب تسجيل جديد (للطالب)
   */
  async create(createEnrollmentDto: CreateEnrollmentDto, studentId: string): Promise<EnrollmentResponseDto> {
    // التحقق من صحة المعرفات
    if (!ObjectId.isValid(studentId)) {
      throw new BadRequestException('معرف الطالب غير صحيح');
    }
    if (!ObjectId.isValid(createEnrollmentDto.course_id)) {
      throw new BadRequestException('معرف الدورة غير صحيح');
    }

    // التحقق من وجود الطالب
    const student = await this.userRepository.findOne({
      where: { _id: new ObjectId(studentId) },
    });
    if (!student) {
      throw new NotFoundException('الطالب غير موجود');
    }
    if (student.role !== 'Student') {
      throw new BadRequestException('المستخدم ليس طالباً');
    }
    if (student.status !== 'Active') {
      throw new BadRequestException('حساب الطالب غير مفعّل');
    }

    // التحقق من وجود الدورة
    const course = await this.courseRepository.findOne({
      where: { _id: new ObjectId(createEnrollmentDto.course_id) },
    });
    if (!course) {
      throw new NotFoundException('الدورة غير موجودة');
    }
    if (course.status !== 'Active') {
      throw new BadRequestException('الدورة غير متاحة للتسجيل');
    }

    // التحقق من السعة
    if (course.current_students >= course.max_students) {
      throw new BadRequestException('الدورة مكتملة العدد');
    }

    // التحقق من عدم التسجيل المسبق
    const existing = await this.enrollmentRepository.findOne({
      where: {
        student_id: studentId,
        course_id: createEnrollmentDto.course_id,
        status: { $ne: EnrollmentStatus.REJECTED },
      },
    });
    if (existing) {
      throw new ConflictException('مسجل بالفعل في هذه الدورة');
    }

    // إنشاء طلب التسجيل
    const enrollment = new Enrollment();
    enrollment.student_id = studentId;
    enrollment.course_id = createEnrollmentDto.course_id;
    enrollment.enrollment_date = new Date();
    enrollment.status = EnrollmentStatus.PENDING;
    enrollment.created_at = new Date();
    enrollment.updated_at = new Date();

    const saved = await this.enrollmentRepository.save(enrollment);

    // إرسال إشعار للمديرين
    await this.notificationsService.notifyAdmins(
      `📝 طلب تسجيل جديد من الطالب "${student.full_name}" في دورة "${course.course_name}"`,
      NotificationType.ENROLLMENT,
    );

    return new EnrollmentResponseDto(saved, {
      student_name: student.full_name,
      student_email: student.email,
      course_name: course.course_name,
      course_code: course.course_code,
    });
  }

  /**
   * الحصول على جميع التسجيلات (مع فلترة)
   */
  async findAll(
    studentId?: string,
    courseId?: string,
    status?: string,
    currentUser?: any,
  ): Promise<EnrollmentResponseDto[]> {
    const filter: any = {};

    if (studentId) {
      if (!ObjectId.isValid(studentId)) {
        throw new BadRequestException('معرف الطالب غير صحيح');
      }
      filter.student_id = studentId;
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

    // إذا كان المستخدم طالباً، يرى فقط تسجيلاته
    if (currentUser && currentUser.role === 'Student') {
      filter.student_id = currentUser.userId;
    }

    // إذا كان المستخدم معلم، يرى فقط تسجيلات دوراته
    if (currentUser && currentUser.role === 'Teacher') {
      const teacherAssignments = await this.teacherAssignmentService.getTeacherAssignments(currentUser.userId);
      const assignedCourseIds = teacherAssignments
        .filter(a => a.is_active)
        .map(a => a.course_id);
      
      if (assignedCourseIds.length > 0) {
        filter.course_id = { $in: assignedCourseIds };
      } else {
        filter.course_id = { $in: [] };
      }
    }

    const enrollments = await this.enrollmentRepository.find({
      where: filter,
      order: { created_at: 'DESC' as any },
    });

    const result: EnrollmentResponseDto[] = [];
    for (const enrollment of enrollments) {
      const extra: any = {};

      try {
        const student = await this.userRepository.findOne({
          where: { _id: new ObjectId(enrollment.student_id) },
        });
        if (student) {
          extra.student_name = student.full_name;
          extra.student_email = student.email;
        }
      } catch (e) {}

      try {
        const course = await this.courseRepository.findOne({
          where: { _id: new ObjectId(enrollment.course_id) },
        });
        if (course) {
          extra.course_name = course.course_name;
          extra.course_code = course.course_code;
        }
      } catch (e) {}

      result.push(new EnrollmentResponseDto(enrollment, extra));
    }

    return result;
  }

  /**
   * الحصول على تسجيل واحد
   */
  async findOne(id: string, currentUser?: any): Promise<EnrollmentResponseDto> {
    if (!ObjectId.isValid(id)) {
      throw new BadRequestException('معرف غير صحيح');
    }

    const enrollment = await this.enrollmentRepository.findOne({
      where: { _id: new ObjectId(id) },
    });
    if (!enrollment) {
      throw new NotFoundException(`التسجيل برقم ${id} غير موجود`);
    }

    // التحقق من صلاحية الطالب (يرى فقط تسجيلاته)
    if (currentUser && currentUser.role === 'Student') {
      if (enrollment.student_id !== currentUser.userId) {
        throw new ForbiddenException('لا يمكنك عرض تسجيل غير خاص بك');
      }
    }

    const extra: any = {};

    try {
      const student = await this.userRepository.findOne({
        where: { _id: new ObjectId(enrollment.student_id) },
      });
      if (student) {
        extra.student_name = student.full_name;
        extra.student_email = student.email;
      }
    } catch (e) {}

    try {
      const course = await this.courseRepository.findOne({
        where: { _id: new ObjectId(enrollment.course_id) },
      });
      if (course) {
        extra.course_name = course.course_name;
        extra.course_code = course.course_code;
      }
    } catch (e) {}

    return new EnrollmentResponseDto(enrollment, extra);
  }

  /**
   * الموافقة على تسجيل (للمدير)
   */
  async approveEnrollment(id: string, status: 'Approved' | 'Rejected', adminId: string): Promise<EnrollmentResponseDto> {
    if (!ObjectId.isValid(id)) {
      throw new BadRequestException('معرف غير صحيح');
    }

    const enrollment = await this.enrollmentRepository.findOne({
      where: { _id: new ObjectId(id) },
    });
    if (!enrollment) {
      throw new NotFoundException(`التسجيل برقم ${id} غير موجود`);
    }

    if (enrollment.status !== EnrollmentStatus.PENDING) {
      throw new BadRequestException('لا يمكن تعديل هذا التسجيل، الحالة الحالية: ' + enrollment.status);
    }

    // التحقق من السعة قبل الموافقة
    if (status === 'Approved') {
      const course = await this.courseRepository.findOne({
        where: { _id: new ObjectId(enrollment.course_id) },
      });
      if (course && course.current_students >= course.max_students) {
        throw new BadRequestException('الدورة مكتملة العدد');
      }

      // تحديث عدد الطلاب في الدورة
      await this.courseRepository.updateOne(
        { _id: new ObjectId(enrollment.course_id) },
        { $inc: { current_students: 1 } },
      );
    }

    // تحديث التسجيل
    enrollment.status = status as EnrollmentStatus;
    enrollment.updated_at = new Date();

    const updated = await this.enrollmentRepository.save(enrollment);

    // إرسال إشعار للطالب
    try {
      const student = await this.userRepository.findOne({
        where: { _id: new ObjectId(enrollment.student_id) },
      });
      const course = await this.courseRepository.findOne({
        where: { _id: new ObjectId(enrollment.course_id) },
      });

      if (student && course) {
        await this.notificationsService.notifyEnrollmentStatus(
          student._id.toString(),
          course.course_name,
          status,
        );
      }
    } catch (e) {}

    return this.findOne(updated._id.toString());
  }

  /**
   * طلبات التسجيل المعلقة (للمدير)
   */
  async getPendingEnrollments(): Promise<EnrollmentResponseDto[]> {
    const enrollments = await this.enrollmentRepository.find({
      where: { status: EnrollmentStatus.PENDING },
      order: { created_at: 'ASC' as any },
    });

    const result: EnrollmentResponseDto[] = [];
    for (const enrollment of enrollments) {
      const extra: any = {};

      try {
        const student = await this.userRepository.findOne({
          where: { _id: new ObjectId(enrollment.student_id) },
        });
        if (student) {
          extra.student_name = student.full_name;
          extra.student_email = student.email;
        }
      } catch (e) {}

      try {
        const course = await this.courseRepository.findOne({
          where: { _id: new ObjectId(enrollment.course_id) },
        });
        if (course) {
          extra.course_name = course.course_name;
          extra.course_code = course.course_code;
        }
      } catch (e) {}

      result.push(new EnrollmentResponseDto(enrollment, extra));
    }

    return result;
  }

  /**
   * تسجيلات طالب معين
   */
  async getStudentEnrollments(studentId: string): Promise<EnrollmentResponseDto[]> {
    if (!ObjectId.isValid(studentId)) {
      throw new BadRequestException('معرف الطالب غير صحيح');
    }
    return this.findAll(studentId);
  }

  /**
   * تسجيلات دورة معينة
   */
  async getCourseEnrollments(courseId: string): Promise<EnrollmentResponseDto[]> {
    if (!ObjectId.isValid(courseId)) {
      throw new BadRequestException('معرف الدورة غير صحيح');
    }
    return this.findAll(undefined, courseId);
  }

  /**
   * حذف تسجيل (للمدير فقط)
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

    const enrollment = await this.enrollmentRepository.findOne({
      where: { _id: new ObjectId(id) },
    });
    if (!enrollment) {
      throw new NotFoundException(`التسجيل برقم ${id} غير موجود`);
    }

    // إذا كان التسجيل مقبولاً، ننقص عدد الطلاب
    if (enrollment.status === EnrollmentStatus.APPROVED) {
      await this.courseRepository.updateOne(
        { _id: new ObjectId(enrollment.course_id) },
        { $inc: { current_students: -1 } },
      );
    }

    await this.enrollmentRepository.delete({ _id: new ObjectId(id) });
  }

  /**
   * إحصائيات التسجيلات
   */
  async getStatistics(): Promise<any> {
    const total = await this.enrollmentRepository.count();

    const statusStats = await this.enrollmentRepository.find({
      select: ['status'],
    });
    const statusCount: Record<string, number> = {};
    for (const e of statusStats) {
      statusCount[e.status] = (statusCount[e.status] || 0) + 1;
    }

    return {
      total,
      statusDistribution: statusCount,
    };
  }
}