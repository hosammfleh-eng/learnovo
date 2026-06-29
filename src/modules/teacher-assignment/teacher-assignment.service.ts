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
import { TeacherAssignment } from './entities/teacher-assignment.entity';
import { AssignTeacherDto } from './dto/create-teacher-assignment.dto';
import { UpdateAssignmentDto } from './dto/update-teacher-assignment.dto';
import { TeacherAssignmentResponseDto } from './dto/teacher-assignment-response.dto';
import { Course } from '../course/entities/course.entity';
import { User } from '../users/entities/user.entity';
import { NotificationsService } from '../notifications/notifications.service';
import { NotificationType  } from '../notifications/entities/notification.entity';

@Injectable()
export class TeacherAssignmentService {
  constructor(
    @InjectRepository(TeacherAssignment)
    private assignmentRepository: MongoRepository<TeacherAssignment>,
    @InjectRepository(Course)
    private courseRepository: MongoRepository<Course>,
    @InjectRepository(User)
    private userRepository: MongoRepository<User>,
    private notificationsService: NotificationsService,
  ) {}

  /**
   * إسناد معلم لدورة (للمدير فقط)
   */
  async assignTeacher(
    assignTeacherDto: AssignTeacherDto,
    adminId: string,
  ): Promise<TeacherAssignmentResponseDto> {
    // التحقق من وجود المدير
    const admin = await this.userRepository.findOne({
      where: { _id: new ObjectId(adminId) },
    });
    if (!admin || admin.role !== 'Admin') {
      throw new ForbiddenException('غير مصرح لك بهذه العملية');
    }

    // التحقق من وجود الدورة
    if (!ObjectId.isValid(assignTeacherDto.course_id)) {
      throw new BadRequestException('معرف الدورة غير صحيح');
    }
    const course = await this.courseRepository.findOne({
      where: { _id: new ObjectId(assignTeacherDto.course_id) },
    });
    if (!course) {
      throw new NotFoundException('الدورة غير موجودة');
    }

    // التحقق من وجود المعلم
    if (!ObjectId.isValid(assignTeacherDto.teacher_id)) {
      throw new BadRequestException('معرف المعلم غير صحيح');
    }
    const teacher = await this.userRepository.findOne({
      where: { _id: new ObjectId(assignTeacherDto.teacher_id) },
    });
    if (!teacher) {
      throw new NotFoundException('المعلم غير موجود');
    }
    if (teacher.role !== 'Teacher') {
      throw new BadRequestException('المستخدم ليس معلم');
    }
    if (teacher.status !== 'Active') {
      throw new BadRequestException('المعلم غير مفعّل');
    }

    // التحقق من عدم التكرار
    const existing = await this.assignmentRepository.findOne({
      where: {
        course_id: assignTeacherDto.course_id,
        teacher_id: assignTeacherDto.teacher_id,
        is_active: true,
      },
    });
    if (existing) {
      throw new ConflictException('هذا المعلم مسند بالفعل لهذه الدورة');
    }

    // ✅ إنشاء الإسناد بالحقول الجديدة فقط
    const assignment = new TeacherAssignment();
    assignment.course_id = assignTeacherDto.course_id;
    assignment.teacher_id = assignTeacherDto.teacher_id;
    assignment.assigned_date = new Date();
    assignment.is_active = true;
    assignment.can_grade = assignTeacherDto.can_grade !== undefined ? assignTeacherDto.can_grade : true;
    assignment.created_at = new Date();
    assignment.updated_at = new Date();

    const saved = await this.assignmentRepository.save(assignment);

// إرسال إشعار للمدير
    await this.notificationsService.notifyAdmins(
      '📚 تم إسناد معلم لدورة',
      NotificationType.SYSTEM,
    );

    return new TeacherAssignmentResponseDto(saved, {
      course_name: course.course_name,
      course_code: course.course_code,
      teacher_name: teacher.full_name,
      teacher_email: teacher.email,
    });
  }

  /**
   * الحصول على جميع الإسنادات
   */
  async findAll(
    courseId?: string,
    teacherId?: string,
    isActive?: boolean,
  ): Promise<TeacherAssignmentResponseDto[]> {
    const filter: any = {};
    if (courseId) filter.course_id = courseId;
    if (teacherId) filter.teacher_id = teacherId;
    if (isActive !== undefined) filter.is_active = isActive;

    const assignments = await this.assignmentRepository.find({
      where: filter,
      order: { assigned_date: 'DESC' as any },
    });

    const result: TeacherAssignmentResponseDto[] = [];
    for (const assignment of assignments) {
      const extra: any = {};

      try {
        const course = await this.courseRepository.findOne({
          where: { _id: new ObjectId(assignment.course_id) },
        });
        if (course) {
          extra.course_name = course.course_name;
          extra.course_code = course.course_code;
        }
      } catch (e) {}

      try {
        const teacher = await this.userRepository.findOne({
          where: { _id: new ObjectId(assignment.teacher_id) },
        });
        if (teacher) {
          extra.teacher_name = teacher.full_name;
          extra.teacher_email = teacher.email;
        }
      } catch (e) {}

      result.push(new TeacherAssignmentResponseDto(assignment, extra));
    }

    return result;
  }

  /**
   * الحصول على إسناد واحد
   */
  async findOne(id: string): Promise<TeacherAssignmentResponseDto> {
    if (!ObjectId.isValid(id)) {
      throw new BadRequestException('معرف غير صحيح');
    }

    const assignment = await this.assignmentRepository.findOne({
      where: { _id: new ObjectId(id) },
    });
    if (!assignment) {
      throw new NotFoundException('الإسناد غير موجود');
    }

    const extra: any = {};

    try {
      const course = await this.courseRepository.findOne({
        where: { _id: new ObjectId(assignment.course_id) },
      });
      if (course) {
        extra.course_name = course.course_name;
        extra.course_code = course.course_code;
      }
    } catch (e) {}

    try {
      const teacher = await this.userRepository.findOne({
        where: { _id: new ObjectId(assignment.teacher_id) },
      });
      if (teacher) {
        extra.teacher_name = teacher.full_name;
        extra.teacher_email = teacher.email;
      }
    } catch (e) {}

    return new TeacherAssignmentResponseDto(assignment, extra);
  }

  /**
   * تحديث إسناد
   */
  async update(
    id: string,
    updateAssignmentDto: UpdateAssignmentDto,
    adminId: string,
  ): Promise<TeacherAssignmentResponseDto> {
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

    const assignment = await this.assignmentRepository.findOne({
      where: { _id: new ObjectId(id) },
    });
    if (!assignment) {
      throw new NotFoundException('الإسناد غير موجود');
    }

    // تحديث الحقول
    if (updateAssignmentDto.is_active !== undefined) {
      assignment.is_active = updateAssignmentDto.is_active;
    }
    if (updateAssignmentDto.can_grade !== undefined) {
      assignment.can_grade = updateAssignmentDto.can_grade;
    }
    assignment.updated_at = new Date();

    const updated = await this.assignmentRepository.save(assignment);

    return this.findOne(updated._id.toString());
  }

  /**
   * إلغاء إسناد معلم من دورة
   */
  async removeAssignment(
    courseId: string,
    teacherId: string,
    adminId: string,
  ): Promise<void> {
    // التحقق من وجود المدير
    const admin = await this.userRepository.findOne({
      where: { _id: new ObjectId(adminId) },
    });
    if (!admin || admin.role !== 'Admin') {
      throw new ForbiddenException('غير مصرح لك بهذه العملية');
    }

    const assignment = await this.assignmentRepository.findOne({
      where: {
        course_id: courseId,
        teacher_id: teacherId,
        is_active: true,
      },
    });
    if (!assignment) {
      throw new NotFoundException('هذا المعلم غير مسند لهذه الدورة');
    }

    assignment.is_active = false;
    assignment.updated_at = new Date();

    await this.assignmentRepository.save(assignment);
  }

  /**
   * حذف إسناد (نهائي)
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

    const assignment = await this.assignmentRepository.findOne({
      where: { _id: new ObjectId(id) },
    });
    if (!assignment) {
      throw new NotFoundException('الإسناد غير موجود');
    }

    await this.assignmentRepository.delete({ _id: new ObjectId(id) });
  }

  /**
   * الحصول على إسنادات دورة معينة
   */
  async getCourseAssignments(courseId: string): Promise<TeacherAssignmentResponseDto[]> {
    if (!ObjectId.isValid(courseId)) {
      throw new BadRequestException('معرف الدورة غير صحيح');
    }
    return this.findAll(courseId, undefined, true);
  }

  /**
   * الحصول على إسنادات معلم معين
   */
  async getTeacherAssignments(teacherId: string): Promise<TeacherAssignmentResponseDto[]> {
    if (!ObjectId.isValid(teacherId)) {
      throw new BadRequestException('معرف المعلم غير صحيح');
    }
    return this.findAll(undefined, teacherId, true);
  }

  /**
   * إحصائيات الإسنادات
   */
  async getStatistics(): Promise<any> {
    const total = await this.assignmentRepository.count();
    const active = await this.assignmentRepository.count({
      where: { is_active: true },
    });
    const inactive = await this.assignmentRepository.count({
      where: { is_active: false },
    });

    // توزيع المعلمين حسب عدد الدورات
    const teachers = await this.assignmentRepository.find({
      where: { is_active: true },
      select: ['teacher_id'],
    });
    const teacherCount: Record<string, number> = {};
    for (const assignment of teachers) {
      teacherCount[assignment.teacher_id] = (teacherCount[assignment.teacher_id] || 0) + 1;
    }

    return {
      total,
      active,
      inactive,
      teacherDistribution: teacherCount,
    };
  }
}