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
import { StudentsService } from './students.service';
import { CreateStudentDto } from './dto/create-student.dto';
import { UpdateStudentDto } from './dto/update-student.dto';
import { StudentResponseDto } from './dto/student-response.dto';
import { EnrollmentStatus, GraduationStatus } from './entities/student.entity';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { User } from '../../common/decorators/user.decorator';
import { UserRole } from '../../common/enums/user-role.enum';

@Controller('students')
@UseGuards(JwtAuthGuard)
export class StudentsController {
  constructor(private readonly studentsService: StudentsService) {}

  /**
   * POST /api/students
   * إنشاء طالب جديد (للمدير فقط)
   */
  @Post()
  @UseGuards(RolesGuard)
  @Roles(UserRole.ADMIN)
  async create(
    @Body() createStudentDto: CreateStudentDto,
    @User() user: any,
  ): Promise<StudentResponseDto> {
    const adminId = user.userId || user.sub || user.id;
    return this.studentsService.create(createStudentDto, adminId);
  }

  /**
   * GET /api/students
   * قائمة الطلاب (مع فلترة)
   */
  @Get()
  async findAll(
    @Query('status') status?: string,
    @Query('enrollmentStatus') enrollmentStatus?: string,
    @Query('graduationStatus') graduationStatus?: string,
    @Query('search') search?: string,
  ): Promise<StudentResponseDto[]> {
    return this.studentsService.findAll(status, enrollmentStatus, graduationStatus, search);
  }

  /**
   * GET /api/students/statistics
   * إحصائيات الطلاب (للمدير فقط)
   */
  @Get('statistics')
  @UseGuards(RolesGuard)
  @Roles(UserRole.ADMIN)
  async getStatistics(): Promise<any> {
    return this.studentsService.getStatistics();
  }

  /**
   * GET /api/students/user/:userId
   * طالب بواسطة user_id
   */
  @Get('user/:userId')
  async findByUserId(@Param('userId') userId: string): Promise<StudentResponseDto> {
    return this.studentsService.findByUserId(userId);
  }

  /**
   * GET /api/students/student-id/:studentId
   * طالب بواسطة student_id
   */
  @Get('student-id/:studentId')
  async findByStudentId(@Param('studentId') studentId: string): Promise<StudentResponseDto> {
    return this.studentsService.findByStudentId(studentId);
  }

  /**
   * GET /api/students/:id
   * تفاصيل طالب
   */
  @Get(':id')
  async findOne(@Param('id') id: string): Promise<StudentResponseDto> {
    return this.studentsService.findOne(id);
  }

  /**
   * PUT /api/students/:id
   * تحديث طالب (للمدير فقط)
   */
  @Put(':id')
  @UseGuards(RolesGuard)
  @Roles(UserRole.ADMIN)
  async update(
    @Param('id') id: string,
    @Body() updateStudentDto: UpdateStudentDto,
    @User() user: any,
  ): Promise<StudentResponseDto> {
    const adminId = user.userId || user.sub || user.id;
    return this.studentsService.update(id, updateStudentDto, adminId);
  }

  /**
   * PUT /api/students/:id/enrollment-status
   * تحديث حالة التسجيل (للمدير فقط)
   */
  @Put(':id/enrollment-status')
  @UseGuards(RolesGuard)
  @Roles(UserRole.ADMIN)
  async updateEnrollmentStatus(
    @Param('id') id: string,
    @Body('enrollmentStatus') enrollmentStatus: EnrollmentStatus,
    @User() user: any,
  ): Promise<StudentResponseDto> {
    const adminId = user.userId || user.sub || user.id;
    return this.studentsService.updateEnrollmentStatus(id, enrollmentStatus, adminId);
  }

  /**
   * PUT /api/students/:id/graduation-status
   * تحديث حالة التخرج (للمدير فقط)
   */
  @Put(':id/graduation-status')
  @UseGuards(RolesGuard)
  @Roles(UserRole.ADMIN)
  async updateGraduationStatus(
    @Param('id') id: string,
    @Body('graduationStatus') graduationStatus: GraduationStatus,
    @User() user: any,
  ): Promise<StudentResponseDto> {
    const adminId = user.userId || user.sub || user.id;
    return this.studentsService.updateGraduationStatus(id, graduationStatus, adminId);
  }

  /**
   * DELETE /api/students/:id
   * حذف طالب (للمدير فقط)
   */
  @Delete(':id')
  @UseGuards(RolesGuard)
  @Roles(UserRole.ADMIN)
  async delete(@Param('id') id: string, @User() user: any): Promise<{ message: string }> {
    const adminId = user.userId || user.sub || user.id;
    await this.studentsService.delete(id, adminId);
    return { message: 'تم حذف الطالب بنجاح' };
  }
}