import {
  Injectable,
  NotFoundException,
  BadRequestException,
  ConflictException,
  ForbiddenException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { MongoRepository } from 'typeorm';
import { ObjectId } from 'mongodb';
import { Student, StudentStatus, EnrollmentStatus, GraduationStatus } from './entities/student.entity';
import { CreateStudentDto } from './dto/create-student.dto';
import { UpdateStudentDto } from './dto/update-student.dto';
import { StudentResponseDto } from './dto/student-response.dto';
import { User } from '../users/entities/user.entity';
import { NotificationsService } from '../notifications/notifications.service';
import { NotificationType} from '../notifications/entities/notification.entity';

@Injectable()
export class StudentsService {
  constructor(
    @InjectRepository(Student)
    private studentRepository: MongoRepository<Student>,
    @InjectRepository(User)
    private userRepository: MongoRepository<User>,
    private notificationsService: NotificationsService,
  ) {}

  /**
   * إنشاء طالب جديد (للمدير فقط)
   */
  async create(createStudentDto: CreateStudentDto, adminId: string): Promise<StudentResponseDto> {
    // التحقق من وجود المدير
    const admin = await this.userRepository.findOne({
      where: { _id: new ObjectId(adminId) },
    });
    if (!admin || admin.role !== 'Admin') {
      throw new ForbiddenException('غير مصرح لك بهذه العملية');
    }

    // التحقق من وجود المستخدم المرتبط
    if (!ObjectId.isValid(createStudentDto.user_id)) {
      throw new BadRequestException('معرف المستخدم غير صحيح');
    }
    const user = await this.userRepository.findOne({
      where: { _id: new ObjectId(createStudentDto.user_id) },
    });
    if (!user) {
      throw new NotFoundException('المستخدم غير موجود');
    }
    if (user.role !== 'Student') {
      throw new BadRequestException('المستخدم ليس طالب');
    }

    // التحقق من عدم تكرار رقم الطالب
    const existing = await this.studentRepository.findOne({
      where: { student_id: createStudentDto.student_id },
    });
    if (existing) {
      throw new ConflictException('رقم الطالب مستخدم بالفعل');
    }

    // التحقق من عدم وجود ملف طالب مسبقاً
    const existingUser = await this.studentRepository.findOne({
      where: { user_id: createStudentDto.user_id },
    });
    if (existingUser) {
      throw new ConflictException('هذا المستخدم لديه ملف طالب بالفعل');
    }

    // ✅ إنشاء الطالب مع الحقول الجديدة فقط
    const student = new Student();
    student.user_id = createStudentDto.user_id;
    student.student_id = createStudentDto.student_id;
    student.enrollment_status = createStudentDto.enrollment_status || EnrollmentStatus.PENDING;
    student.graduation_status = createStudentDto.graduation_status || GraduationStatus.NOT_ELIGIBLE;
    student.registered_at = createStudentDto.registered_at ? new Date(createStudentDto.registered_at) : new Date();

    const saved = await this.studentRepository.save(student);

    // إرسال إشعار للمدير
    await this.notificationsService.notifyAdmins(
      '📘 تم إنشاء ملف طالب جديد',
      NotificationType.SYSTEM,
    );

    return new StudentResponseDto(saved, {
      user_name: user.full_name,
      user_email: user.email,
      user_role: user.role,
    });
  }

  /**
   * الحصول على جميع الطلاب
   */
  async findAll(
    status?: string,
    enrollmentStatus?: string,
    graduationStatus?: string,
    search?: string,
  ): Promise<StudentResponseDto[]> {
    const filter: any = {};

    if (status) filter.status = status;
    if (enrollmentStatus) filter.enrollment_status = enrollmentStatus;
    if (graduationStatus) filter.graduation_status = graduationStatus;

    let students = await this.studentRepository.find({
      where: filter,
      order: { registered_at: 'DESC' as any },
    });

    // بحث نصي
    if (search) {
      students = students.filter((s) =>
        s.student_id.includes(search) ||
        (s.user_id && s.user_id.includes(search))
      );
    }

    const result: StudentResponseDto[] = [];
    for (const student of students) {
      const extra: any = {};
      try {
        const user = await this.userRepository.findOne({
          where: { _id: new ObjectId(student.user_id) },
        });
        if (user) {
          extra.user_name = user.full_name;
          extra.user_email = user.email;
          extra.user_role = user.role;
        }
      } catch (e) {}
      result.push(new StudentResponseDto(student, extra));
    }

    return result;
  }

  /**
   * الحصول على طالب واحد
   */
  async findOne(id: string): Promise<StudentResponseDto> {
    if (!ObjectId.isValid(id)) {
      throw new BadRequestException('معرف غير صحيح');
    }

    const student = await this.studentRepository.findOne({
      where: { _id: new ObjectId(id) },
    });
    if (!student) {
      throw new NotFoundException(`الطالب برقم ${id} غير موجود`);
    }

    const extra: any = {};
    try {
      const user = await this.userRepository.findOne({
        where: { _id: new ObjectId(student.user_id) },
      });
      if (user) {
        extra.user_name = user.full_name;
        extra.user_email = user.email;
        extra.user_role = user.role;
      }
    } catch (e) {}

    return new StudentResponseDto(student, extra);
  }

  /**
   * الحصول على طالب بواسطة user_id
   */
  async findByUserId(userId: string): Promise<StudentResponseDto> {
    if (!ObjectId.isValid(userId)) {
      throw new BadRequestException('معرف المستخدم غير صحيح');
    }

    const student = await this.studentRepository.findOne({
      where: { user_id: userId },
    });
    if (!student) {
      throw new NotFoundException('ملف الطالب غير موجود لهذا المستخدم');
    }

    const extra: any = {};
    try {
      const user = await this.userRepository.findOne({
        where: { _id: new ObjectId(userId) },
      });
      if (user) {
        extra.user_name = user.full_name;
        extra.user_email = user.email;
        extra.user_role = user.role;
      }
    } catch (e) {}

    return new StudentResponseDto(student, extra);
  }

  /**
   * الحصول على طالب بواسطة student_id
   */
  async findByStudentId(studentId: string): Promise<StudentResponseDto> {
    const student = await this.studentRepository.findOne({
      where: { student_id: studentId },
    });
    if (!student) {
      throw new NotFoundException(`الطالب برقم ${studentId} غير موجود`);
    }

    const extra: any = {};
    try {
      const user = await this.userRepository.findOne({
        where: { _id: new ObjectId(student.user_id) },
      });
      if (user) {
        extra.user_name = user.full_name;
        extra.user_email = user.email;
        extra.user_role = user.role;
      }
    } catch (e) {}

    return new StudentResponseDto(student, extra);
  }

  /**
   * تحديث طالب
   */
  async update(
    id: string,
    updateStudentDto: UpdateStudentDto,
    adminId: string,
  ): Promise<StudentResponseDto> {
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

    const student = await this.studentRepository.findOne({
      where: { _id: new ObjectId(id) },
    });
    if (!student) {
      throw new NotFoundException(`الطالب برقم ${id} غير موجود`);
    }

    // تحديث الحقول
    if (updateStudentDto.student_id) student.student_id = updateStudentDto.student_id;
    if (updateStudentDto.enrollment_status) student.enrollment_status = updateStudentDto.enrollment_status;
    if (updateStudentDto.graduation_status) student.graduation_status = updateStudentDto.graduation_status;
    if (updateStudentDto.registered_at) student.registered_at = new Date(updateStudentDto.registered_at);

    const updated = await this.studentRepository.save(student);

    return this.findOne(updated._id.toString());
  }

  /**
   * تحديث حالة التسجيل
   */
  async updateEnrollmentStatus(
    id: string,
    enrollmentStatus: EnrollmentStatus,
    adminId: string,
  ): Promise<StudentResponseDto> {
    const admin = await this.userRepository.findOne({
      where: { _id: new ObjectId(adminId) },
    });
    if (!admin || admin.role !== 'Admin') {
      throw new ForbiddenException('غير مصرح لك بهذه العملية');
    }

    if (!ObjectId.isValid(id)) {
      throw new BadRequestException('معرف غير صحيح');
    }

    const student = await this.studentRepository.findOne({
      where: { _id: new ObjectId(id) },
    });
    if (!student) {
      throw new NotFoundException(`الطالب برقم ${id} غير موجود`);
    }

    student.enrollment_status = enrollmentStatus;
    const updated = await this.studentRepository.save(student);

    return this.findOne(updated._id.toString());
  }

  /**
   * تحديث حالة التخرج
   */
  async updateGraduationStatus(
    id: string,
    graduationStatus: GraduationStatus,
    adminId: string,
  ): Promise<StudentResponseDto> {
    const admin = await this.userRepository.findOne({
      where: { _id: new ObjectId(adminId) },
    });
    if (!admin || admin.role !== 'Admin') {
      throw new ForbiddenException('غير مصرح لك بهذه العملية');
    }

    if (!ObjectId.isValid(id)) {
      throw new BadRequestException('معرف غير صحيح');
    }

    const student = await this.studentRepository.findOne({
      where: { _id: new ObjectId(id) },
    });
    if (!student) {
      throw new NotFoundException(`الطالب برقم ${id} غير موجود`);
    }

    student.graduation_status = graduationStatus;
    const updated = await this.studentRepository.save(student);

    return this.findOne(updated._id.toString());
  }

  /**
   * حذف طالب
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

    const student = await this.studentRepository.findOne({
      where: { _id: new ObjectId(id) },
    });
    if (!student) {
      throw new NotFoundException(`الطالب برقم ${id} غير موجود`);
    }

    await this.studentRepository.delete({ _id: new ObjectId(id) });
  }

  /**
   * إحصائيات الطلاب
   */
  async getStatistics(): Promise<any> {
    const total = await this.studentRepository.count();
    
    const enrollmentStats = await this.studentRepository.find({
      select: ['enrollment_status'],
    });
    const enrollmentCount: Record<string, number> = {};
    for (const student of enrollmentStats) {
      enrollmentCount[student.enrollment_status] = (enrollmentCount[student.enrollment_status] || 0) + 1;
    }

    const graduationStats = await this.studentRepository.find({
      select: ['graduation_status'],
    });
    const graduationCount: Record<string, number> = {};
    for (const student of graduationStats) {
      graduationCount[student.graduation_status] = (graduationCount[student.graduation_status] || 0) + 1;
    }

    return {
      total,
      enrollmentDistribution: enrollmentCount,
      graduationDistribution: graduationCount,
    };
  }
}