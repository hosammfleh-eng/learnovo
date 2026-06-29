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
import { Grade, ExamType, ResultStatus } from './entities/grade.entity';
import { CreateGradeDto } from './dto/create-grade.dto';
import { UpdateGradeDto } from './dto/update-grade.dto';
import { GradeResponseDto } from './dto/grade-response.dto';
import { User } from '../users/entities/user.entity';
import { Course } from '../course/entities/course.entity';
import { NotificationsService } from '../notifications/notifications.service';
import { NotificationType } from '../notifications/entities/notification.entity';

@Injectable()
export class GradesService {
  constructor(
    @InjectRepository(Grade)
    private gradeRepository: MongoRepository<Grade>,
    @InjectRepository(User)
    private userRepository: MongoRepository<User>,
    @InjectRepository(Course)
    private courseRepository: MongoRepository<Course>,
    private notificationsService: NotificationsService,
  ) {}

  /**
   * حساب النتيجة الإجمالية وحالة النجاح/الرسوب
   */
  private calculateTotalGrade(grade_value: number, weight: number): { total_grade: number; result_status: ResultStatus | null } {
    if (grade_value === null || grade_value === undefined) {
      return { total_grade: 0, result_status: null };
    }

    const total_grade = grade_value * weight;

    // إذا كان الوزن 0، لا نحسب النتيجة
    if (weight === 0) {
      return { total_grade, result_status: null };
    }

    // إذا كانت الدرجة 50 أو أقل = رسوب
    const result_status = grade_value >= 50 ? ResultStatus.PASS : ResultStatus.FAIL;

    return { total_grade, result_status };
  }

  /**
   * إنشاء درجة جديدة (للمعلم فقط)
   */
  async create(createGradeDto: CreateGradeDto, teacherId: string): Promise<GradeResponseDto> {
    // التحقق من وجود المعلم
    const teacher = await this.userRepository.findOne({
      where: { _id: new ObjectId(teacherId) },
    });
    if (!teacher || teacher.role !== 'Teacher') {
      throw new ForbiddenException('غير مصرح لك بإدخال العلامات');
    }

    // التحقق من وجود الطالب
    if (!ObjectId.isValid(createGradeDto.student_user_id)) {
      throw new BadRequestException('معرف الطالب غير صحيح');
    }
    const student = await this.userRepository.findOne({
      where: { _id: new ObjectId(createGradeDto.student_user_id) },
    });
    if (!student || student.role !== 'Student') {
      throw new NotFoundException('الطالب غير موجود');
    }

    // التحقق من وجود الدورة
    if (!ObjectId.isValid(createGradeDto.course_id)) {
      throw new BadRequestException('معرف الدورة غير صحيح');
    }
    const course = await this.courseRepository.findOne({
      where: { _id: new ObjectId(createGradeDto.course_id) },
    });
    if (!course) {
      throw new NotFoundException('الدورة غير موجودة');
    }

    // التحقق من عدم وجود درجة مكررة لنفس الطالب ونفس الدورة ونفس نوع الامتحان
    const existing = await this.gradeRepository.findOne({
      where: {
        student_user_id: createGradeDto.student_user_id,
        course_id: createGradeDto.course_id,
        exam_type: createGradeDto.exam_type,
        is_deleted: false,
      },
    });
    if (existing) {
      throw new ConflictException(`يوجد بالفعل درجة لنوع الامتحان "${createGradeDto.exam_type}" لهذا الطالب في هذه الدورة`);
    }

    // حساب الدرجة الإجمالية وحالة النجاح
    const { total_grade, result_status } = this.calculateTotalGrade(
      createGradeDto.grade_value,
      createGradeDto.weight,
    );

    // إنشاء الدرجة
    const grade = new Grade();
    grade.student_user_id = createGradeDto.student_user_id;
    grade.course_id = createGradeDto.course_id;
    grade.teacher_user_id = teacherId;
    grade.exam_type = createGradeDto.exam_type;
    grade.grade_value = createGradeDto.grade_value;
    grade.weight = createGradeDto.weight;
    grade.total_grade = total_grade;
    grade.result_status = result_status;
    grade.is_deleted = false;
    grade.created_at = new Date();
    grade.updated_at = new Date();

    const saved = await this.gradeRepository.save(grade);

    // إرسال إشعار للطالب
    await this.notificationsService.create({
      user_id: student._id.toString(),
      message: `📊 تم إدخال علامة "${createGradeDto.exam_type}" في دورة "${course.course_name}" بنسبة ${createGradeDto.grade_value}%`,
      type: NotificationType.GRADE,
    });

    return this.findOne(saved._id.toString());
  }

  /**
   * الحصول على جميع الدرجات
   */
  async findAll(
    studentId?: string,
    courseId?: string,
    teacherId?: string,
    examType?: string,
  ): Promise<GradeResponseDto[]> {
    const filter: any = { is_deleted: false };

    if (studentId) filter.student_user_id = studentId;
    if (courseId) filter.course_id = courseId;
    if (teacherId) filter.teacher_user_id = teacherId;
    if (examType) filter.exam_type = examType;

    const grades = await this.gradeRepository.find({
      where: filter,
      order: { created_at: 'DESC' as any },
    });

    const result: GradeResponseDto[] = [];
    for (const grade of grades) {
      const extra: any = {};

      try {
        const student = await this.userRepository.findOne({
          where: { _id: new ObjectId(grade.student_user_id) },
        });
        if (student) {
          extra.student_name = student.full_name;
          extra.student_email = student.email;
        }
      } catch (e) {}

      try {
        const course = await this.courseRepository.findOne({
          where: { _id: new ObjectId(grade.course_id) },
        });
        if (course) {
          extra.course_name = course.course_name;
          extra.course_code = course.course_code;
        }
      } catch (e) {}

      try {
        const teacher = await this.userRepository.findOne({
          where: { _id: new ObjectId(grade.teacher_user_id) },
        });
        if (teacher) {
          extra.teacher_name = teacher.full_name;
        }
      } catch (e) {}

      result.push(new GradeResponseDto(grade, extra));
    }

    return result;
  }

  /**
   * الحصول على درجة واحدة
   */
  async findOne(id: string): Promise<GradeResponseDto> {
    if (!ObjectId.isValid(id)) {
      throw new BadRequestException('معرف غير صحيح');
    }

    const grade = await this.gradeRepository.findOne({
      where: { _id: new ObjectId(id), is_deleted: false },
    });
    if (!grade) {
      throw new NotFoundException(`الدرجة برقم ${id} غير موجودة`);
    }

    const extra: any = {};

    try {
      const student = await this.userRepository.findOne({
        where: { _id: new ObjectId(grade.student_user_id) },
      });
      if (student) {
        extra.student_name = student.full_name;
        extra.student_email = student.email;
      }
    } catch (e) {}

    try {
      const course = await this.courseRepository.findOne({
        where: { _id: new ObjectId(grade.course_id) },
      });
      if (course) {
        extra.course_name = course.course_name;
        extra.course_code = course.course_code;
      }
    } catch (e) {}

    try {
      const teacher = await this.userRepository.findOne({
        where: { _id: new ObjectId(grade.teacher_user_id) },
      });
      if (teacher) {
        extra.teacher_name = teacher.full_name;
      }
    } catch (e) {}

    return new GradeResponseDto(grade, extra);
  }

  /**
   * تحديث درجة (للمعلم فقط)
   */
  async update(id: string, updateGradeDto: UpdateGradeDto, teacherId: string): Promise<GradeResponseDto> {
    if (!ObjectId.isValid(id)) {
      throw new BadRequestException('معرف غير صحيح');
    }

    const grade = await this.gradeRepository.findOne({
      where: { _id: new ObjectId(id), is_deleted: false },
    });
    if (!grade) {
      throw new NotFoundException(`الدرجة برقم ${id} غير موجودة`);
    }

    // التحقق من أن المعلم هو من أدخل الدرجة
    if (grade.teacher_user_id !== teacherId) {
      throw new ForbiddenException('لا يمكنك تعديل درجة غير خاصة بك');
    }

    // تحديث الحقول
    let gradeValue = grade.grade_value;
    let weight = grade.weight;

    if (updateGradeDto.exam_type) grade.exam_type = updateGradeDto.exam_type;
    if (updateGradeDto.grade_value !== undefined) {
      grade.grade_value = updateGradeDto.grade_value;
      gradeValue = updateGradeDto.grade_value;
    }
    if (updateGradeDto.weight !== undefined) {
      grade.weight = updateGradeDto.weight;
      weight = updateGradeDto.weight;
    }


    // ✅ تعيين modified_by و modified_at
    grade.modified_by = teacherId;
    

    // إعادة حساب الدرجة الإجمالية
    const { total_grade, result_status } = this.calculateTotalGrade(gradeValue, weight);
    grade.total_grade = total_grade;
    grade.result_status = result_status;

    grade.updated_at = new Date();

    const updated = await this.gradeRepository.save(grade);

    return this.findOne(updated._id.toString());
  }

   async updateByAdmin(id: string, updateGradeDto: UpdateGradeDto, adminId: string): Promise<GradeResponseDto> {
    if (!ObjectId.isValid(id)) {
      throw new BadRequestException('معرف غير صحيح');
    }

    const grade = await this.gradeRepository.findOne({
      where: { _id: new ObjectId(id), is_deleted: false },
    });
    if (!grade) {
      throw new NotFoundException(`الدرجة برقم ${id} غير موجودة`);
    }

    // التحقق من وجود المدير
    const admin = await this.userRepository.findOne({
      where: { _id: new ObjectId(adminId) },
    });
    if (!admin || admin.role !== 'Admin') {
      throw new ForbiddenException('غير مصرح لك بتعديل الدرجة');
    }

    // تحديث الحقول
    let gradeValue = grade.grade_value;
    let weight = grade.weight;

    if (updateGradeDto.exam_type) grade.exam_type = updateGradeDto.exam_type;
    if (updateGradeDto.grade_value !== undefined) {
      grade.grade_value = updateGradeDto.grade_value;
      gradeValue = updateGradeDto.grade_value;
    }
    if (updateGradeDto.weight !== undefined) {
      grade.weight = updateGradeDto.weight;
      weight = updateGradeDto.weight;
    }
   

    // ✅ تعيين modified_by و modified_at
    grade.modified_by = adminId;
     

    // إعادة حساب الدرجة الإجمالية
    const { total_grade, result_status } = this.calculateTotalGrade(gradeValue, weight);
    grade.total_grade = total_grade;
    grade.result_status = result_status;

    grade.updated_at = new Date();

    const updated = await this.gradeRepository.save(grade);

    return this.findOne(updated._id.toString());
  }

  /**
   * حذف درجة (للمعلم فقط)
   */
  async delete(id: string, teacherId: string): Promise<void> {
    if (!ObjectId.isValid(id)) {
      throw new BadRequestException('معرف غير صحيح');
    }

    const grade = await this.gradeRepository.findOne({
      where: { _id: new ObjectId(id), is_deleted: false },
    });
    if (!grade) {
      throw new NotFoundException(`الدرجة برقم ${id} غير موجودة`);
    }

    if (grade.teacher_user_id !== teacherId) {
      throw new ForbiddenException('لا يمكنك حذف درجة غير خاصة بك');
    }

    grade.is_deleted = true;
    grade.updated_at = new Date();
    await this.gradeRepository.save(grade);
  }

  /**
   * حساب المعدل التراكمي للطالب
   */
  async calculateStudentGPA(studentId: string): Promise<any> {
    if (!ObjectId.isValid(studentId)) {
      throw new BadRequestException('معرف الطالب غير صحيح');
    }

    const grades = await this.gradeRepository.find({
      where: { student_user_id: studentId, is_deleted: false },
    });

    if (grades.length === 0) {
      return {
        student_id: studentId,
        total_grades: 0,
        average_grade: 0,
        gpa: 0,
        total_weighted_score: 0,
        total_weight: 0,
        passed_courses: 0,
        failed_courses: 0,
      };
    }

    let totalWeightedScore = 0;
    let totalWeight = 0;
    let passed = 0;
    let failed = 0;

    for (const grade of grades) {
      totalWeightedScore += grade.total_grade;
      totalWeight += grade.weight;

      if (grade.result_status === ResultStatus.PASS) {
        passed++;
      } else if (grade.result_status === ResultStatus.FAIL) {
        failed++;
      }
    }

    const average = totalWeight > 0 ? totalWeightedScore / totalWeight : 0;

    // تحويل النسبة المئوية إلى GPA (مقياس 4)
    let gpa = 0;
    if (average >= 90) gpa = 4.0;
    else if (average >= 85) gpa = 3.7;
    else if (average >= 80) gpa = 3.3;
    else if (average >= 75) gpa = 3.0;
    else if (average >= 70) gpa = 2.7;
    else if (average >= 65) gpa = 2.3;
    else if (average >= 60) gpa = 2.0;
    else if (average >= 50) gpa = 1.0;
    else gpa = 0.0;

    return {
      student_id: studentId,
      total_grades: grades.length,
      average_grade: Math.round(average * 100) / 100,
      gpa: Math.round(gpa * 100) / 100,
      total_weighted_score: Math.round(totalWeightedScore * 100) / 100,
      total_weight: Math.round(totalWeight * 100) / 100,
      passed_courses: passed,
      failed_courses: failed,
    };
  }

  /**
   * الحصول على درجات طالب معين
   */
  async getStudentGrades(studentId: string): Promise<GradeResponseDto[]> {
    if (!ObjectId.isValid(studentId)) {
      throw new BadRequestException('معرف الطالب غير صحيح');
    }
    return this.findAll(studentId);
  }

  /**
   * الحصول على درجات دورة معينة
   */
  async getCourseGrades(courseId: string): Promise<GradeResponseDto[]> {
    if (!ObjectId.isValid(courseId)) {
      throw new BadRequestException('معرف الدورة غير صحيح');
    }
    return this.findAll(undefined, courseId);
  }

  /**
   * إحصائيات الدرجات
   */
  async getStatistics(): Promise<any> {
    const total = await this.gradeRepository.count({ where: { is_deleted: false } });

    const examTypeStats = await this.gradeRepository.find({
      where: { is_deleted: false },
      select: ['exam_type'],
    });
    const examTypeCount: Record<string, number> = {};
    for (const g of examTypeStats) {
      examTypeCount[g.exam_type] = (examTypeCount[g.exam_type] || 0) + 1;
    }

    const resultStats = await this.gradeRepository.find({
      where: { is_deleted: false },
      select: ['result_status'],
    });
    const resultCount: Record<string, number> = { pass: 0, fail: 0 };
    for (const g of resultStats) {
      if (g.result_status === ResultStatus.PASS) resultCount.pass++;
      else if (g.result_status === ResultStatus.FAIL) resultCount.fail++;
    }

    // حساب متوسط الدرجات
    const grades = await this.gradeRepository.find({
      where: { is_deleted: false },
      select: ['grade_value'],
    });
    let totalGrades = 0;
    for (const g of grades) {
      totalGrades += g.grade_value || 0;
    }
    const average = grades.length > 0 ? totalGrades / grades.length : 0;

    return {
      total,
      examTypeDistribution: examTypeCount,
      resultDistribution: resultCount,
      averageGrade: Math.round(average * 100) / 100,
    };
  }
}