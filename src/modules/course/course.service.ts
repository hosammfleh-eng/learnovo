import { Injectable, NotFoundException, BadRequestException, ConflictException, ForbiddenException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { MongoRepository } from 'typeorm';
import { ObjectId } from 'mongodb';
import { Course, CourseStatus } from './entities/course.entity';
import { CreateCourseDto } from './dto/create-course.dto';
import { UpdateCourseDto } from './dto/update-course.dto';
import { CourseResponseDto } from './dto/course-response.dto';
import { User } from '../users/entities/user.entity';
import { Enrollment, EnrollmentStatus } from '../enrollments/entities/enrollment.entity';
import { TeacherAssignment } from '../teacher-assignment/entities/teacher-assignment.entity';

@Injectable()
export class CourseService {
  constructor(
    @InjectRepository(Course)
    private courseRepository: MongoRepository<Course>,
    @InjectRepository(User)
    private userRepository: MongoRepository<User>,
    @InjectRepository(TeacherAssignment)
    private teacherAssignmentRepository: MongoRepository<TeacherAssignment>,
    @InjectRepository(Enrollment)
    private enrollmentRepository: MongoRepository<Enrollment>,
  ) {}

  /**
   * إنشاء دورة جديدة (للمدير فقط)
   */
 async create(createCourseDto: CreateCourseDto, adminId: string): Promise<CourseResponseDto> {
    // التحقق من وجود المدير
    if (!ObjectId.isValid(adminId)) {
      throw new BadRequestException('معرف المدير غير صحيح');
    }
    const admin = await this.userRepository.findOne({
      where: { _id: new ObjectId(adminId) },
    });
    if (!admin || admin.role !== 'Admin') {
      throw new ForbiddenException('غير مصرح لك بإنشاء دورة');
    }

    // التحقق من تكرار كود الدورة
    const existing = await this.courseRepository.findOne({
      where: { course_code: createCourseDto.course_code },
    });
    if (existing) {
      throw new ConflictException('كود الدورة مستخدم بالفعل');
    }

    // إنشاء الدورة
    const course = new Course();
    course.course_name = createCourseDto.course_name;
    course.course_code = createCourseDto.course_code;
    course.description = createCourseDto.description || null;
    course.credit_hours = createCourseDto.credit_hours || 3;
    course.max_students = createCourseDto.max_students || 30;
    course.current_students = 0;
    course.start_date = createCourseDto.start_date ? new Date(createCourseDto.start_date) : null;
    course.end_date = createCourseDto.end_date ? new Date(createCourseDto.end_date) : null;
    course.status = createCourseDto.status || CourseStatus.DRAFT;
    course.created_by = adminId;
    course.created_at = new Date();
    course.updated_at = new Date();

    const saved = await this.courseRepository.save(course);

    return new CourseResponseDto(saved, {
      created_by_name: admin.full_name,
    });
  }

  /**
   * الحصول على جميع الدورات (مع فلترة)
   */
  async findAll(status?: string): Promise<CourseResponseDto[]> {
    const filter: any = {};
    if (status) {
      filter.status = status;
    }

    const courses = await this.courseRepository.find({
      where: filter,
      order: { created_at: 'DESC' as any },
    });

    const result: CourseResponseDto[] = [];
    for (const course of courses) {
      const extra: any = {};
      // جلب اسم المدير
      try {
        const admin = await this.userRepository.findOne({
          where: { _id: new ObjectId(course.created_by) },
        });
        if (admin) {
          extra.created_by_name = admin.full_name;
        }
      } catch (e) {}
      result.push(new CourseResponseDto(course, extra));
    }

    return result;
  }

  /**
   * الحصول على الدورات المتاحة للتسجيل (Active وليست مكتملة)
   */
  async getAvailableCourses(): Promise<CourseResponseDto[]> {
    const courses = await this.courseRepository.find({
      where: {
        status: CourseStatus.ACTIVE,
        // نستخدم $expr للمقارنة بين current_students و max_students
        // لكن TypeORM لا يدعم $expr بسهولة، نستخدم فلترة بعد الجلب
      },
      order: { created_at: 'DESC' as any },
    });

    // فلترة يدوية للدورات التي لم تكتمل
    const available = courses.filter(
      (c) => c.current_students < c.max_students,
    );

    const result: CourseResponseDto[] = [];
    for (const course of available) {
      const extra: any = {};
      try {
        const admin = await this.userRepository.findOne({
          where: { _id: new ObjectId(course.created_by) },
        });
        if (admin) {
          extra.created_by_name = admin.full_name;
        }
      } catch (e) {}
      result.push(new CourseResponseDto(course, extra));
    }

    return result;
  }

  /**
   * الحصول على دورة واحدة
   */
  async findOne(id: string): Promise<CourseResponseDto> {
    if (!ObjectId.isValid(id)) {
      throw new BadRequestException('معرف غير صحيح');
    }

    const course = await this.courseRepository.findOne({
      where: { _id: new ObjectId(id) },
    });
    if (!course) {
      throw new NotFoundException(`الدورة برقم ${id} غير موجودة`);
    }

    const extra: any = {};
    try {
      const admin = await this.userRepository.findOne({
        where: { _id: new ObjectId(course.created_by) },
      });
      if (admin) {
        extra.created_by_name = admin.full_name;
      }
    } catch (e) {}

    return new CourseResponseDto(course, extra);
  }

  /**
   * تحديث دورة (للمدير فقط)
   */
async update(id: string, updateCourseDto: UpdateCourseDto, adminId: string): Promise<CourseResponseDto> {
    // ... التحقق من المدير ...

    const course = await this.courseRepository.findOne({
      where: { _id: new ObjectId(id) },
    });
    if (!course) {
      throw new NotFoundException(`الدورة برقم ${id} غير موجودة`);
    }

    // إذا تم تغيير الكود، تحقق من عدم التكرار
    if (updateCourseDto.course_code && updateCourseDto.course_code !== course.course_code) {
      const existing = await this.courseRepository.findOne({
        where: { course_code: updateCourseDto.course_code },
      });
      if (existing) {
        throw new ConflictException('كود الدورة مستخدم بالفعل');
      }
    }

    // تحديث الحقول
    if (updateCourseDto.course_name) course.course_name = updateCourseDto.course_name;
    if (updateCourseDto.course_code) course.course_code = updateCourseDto.course_code;
    if (updateCourseDto.description !== undefined) course.description = updateCourseDto.description;
    if (updateCourseDto.credit_hours) course.credit_hours = updateCourseDto.credit_hours;
    if (updateCourseDto.max_students) course.max_students = updateCourseDto.max_students;
    if (updateCourseDto.start_date) course.start_date = new Date(updateCourseDto.start_date);
    if (updateCourseDto.end_date) course.end_date = new Date(updateCourseDto.end_date);
    if (updateCourseDto.status) course.status = updateCourseDto.status;

    course.updated_at = new Date();

    const updated = await this.courseRepository.save(course);

    return new CourseResponseDto(updated, {
      created_by_name: (await this.userRepository.findOne({ where: { _id: new ObjectId(course.created_by) } }))?.full_name,
    });
  }

  /**
   * تحديث حالة الدورة (للمدير فقط)
   */
  async updateStatus(id: string, status: CourseStatus, adminId: string): Promise<CourseResponseDto> {
    return this.update(id, { status }, adminId);
  }

  /**
   * حذف دورة (للمدير فقط)
   * يمنع الحذف إذا كان هناك طلاب مسجلين (current_students > 0)
   */
  async remove(id: string, adminId: string): Promise<void> {
    if (!ObjectId.isValid(id)) {
      throw new BadRequestException('معرف غير صحيح');
    }

    // التحقق من وجود المدير
    if (!ObjectId.isValid(adminId)) {
      throw new BadRequestException('معرف المدير غير صحيح');
    }
    const admin = await this.userRepository.findOne({
      where: { _id: new ObjectId(adminId) },
    });
    if (!admin || admin.role !== 'Admin') {
      throw new ForbiddenException('غير مصرح لك بحذف الدورة');
    }

    const course = await this.courseRepository.findOne({
      where: { _id: new ObjectId(id) },
    });
    if (!course) {
      throw new NotFoundException(`الدورة برقم ${id} غير موجودة`);
    }

    if (course.current_students > 0) {
      throw new BadRequestException('لا يمكن حذف الدورة لوجود طلاب مسجلين فيها');
    }

    await this.courseRepository.delete({ _id: new ObjectId(id) });
  }

  /**
   * الحصول على دورات معلم معين (من خلال TeacherAssignment)
   */
  async getTeacherCourses(teacherId: string): Promise<CourseResponseDto[]> {
    if (!ObjectId.isValid(teacherId)) {
      return [];
    }

    const assignments = await this.teacherAssignmentRepository.find({
      where: { teacher_id: teacherId, is_active: true },
    });

    if (assignments.length === 0) {
      return [];
    }

    const courseIds = assignments.map((a) => a.course_id);
    const courses = await this.courseRepository.find({
      where: { _id: { $in: courseIds.map((id) => new ObjectId(id)) } } as any,
    });

    const result: CourseResponseDto[] = [];
    for (const course of courses) {
      const extra: any = {};
      try {
        const admin = await this.userRepository.findOne({
          where: { _id: new ObjectId(course.created_by) },
        });
        if (admin) {
          extra.created_by_name = admin.full_name;
        }
      } catch (e) {}
      result.push(new CourseResponseDto(course, extra));
    }

    return result;
  }

  /**
   * الحصول على دورات طالب معين (من خلال Enrollments)
   */
  async getStudentCourses(studentId: string): Promise<CourseResponseDto[]> {
    if (!ObjectId.isValid(studentId)) {
      return [];
    }

    const enrollments = await this.enrollmentRepository.find({
      where: { student_id: studentId, status: EnrollmentStatus.APPROVED },
    });

    if (enrollments.length === 0) {
      return [];
    }

    const courseIds = enrollments.map((e) => e.course_id);
    const courses = await this.courseRepository.find({
      where: { _id: { $in: courseIds.map((id) => new ObjectId(id)) } } as any,
    });

    const result: CourseResponseDto[] = [];
    for (const course of courses) {
      const extra: any = {};
      try {
        const admin = await this.userRepository.findOne({
          where: { _id: new ObjectId(course.created_by) },
        });
        if (admin) {
          extra.created_by_name = admin.full_name;
        }
      } catch (e) {}
      result.push(new CourseResponseDto(course, extra));
    }

    return result;
  }

  /**
   * إحصائيات الدورات
   */
  async getStatistics(): Promise<any> {
    const total = await this.courseRepository.count();
    return {
      courses: total,
      students: 0,
      teachers: 0,
      graduates: 0,
    };
  }
}