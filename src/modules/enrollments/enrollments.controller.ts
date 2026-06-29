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
  ForbiddenException,
} from '@nestjs/common';
import { EnrollmentsService } from './enrollments.service';
import { CreateEnrollmentDto } from './dto/create-enrollment.dto';
import { EnrollmentResponseDto } from './dto/enrollment-response.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { User } from '../../common/decorators/user.decorator';
import { UserRole } from '../../common/enums/user-role.enum';

@Controller('enrollments')
@UseGuards(JwtAuthGuard)
export class EnrollmentsController {
  constructor(private readonly enrollmentsService: EnrollmentsService) {}

  /**
   * POST /api/enrollments
   * طلب تسجيل في دورة (للطالب)
   */
  @Post()
  async create(
    @Body() createEnrollmentDto: CreateEnrollmentDto,
    @User() user: any,
  ): Promise<EnrollmentResponseDto> {
    const studentId = user.userId || user.sub || user.id;
    return this.enrollmentsService.create(createEnrollmentDto, studentId);
  }

  /**
   * GET /api/enrollments
   * قائمة التسجيلات (مع فلترة)
   */
  @Get()
  async findAll(
    @Query('studentId') studentId?: string,
    @Query('courseId') courseId?: string,
    @Query('status') status?: string,
    @User() user?: any,
  ): Promise<EnrollmentResponseDto[]> {
    return this.enrollmentsService.findAll(studentId, courseId, status, user);
  }

  /**
   * GET /api/enrollments/statistics
   * إحصائيات التسجيلات (للمدير فقط)
   */
  @Get('statistics')
  @UseGuards(RolesGuard)
  @Roles(UserRole.ADMIN)
  async getStatistics(): Promise<any> {
    return this.enrollmentsService.getStatistics();
  }

  /**
   * GET /api/enrollments/pending
   * طلبات التسجيل المعلقة (للمدير فقط)
   */
  @Get('pending')
  @UseGuards(RolesGuard)
  @Roles(UserRole.ADMIN)
  async getPendingEnrollments(): Promise<EnrollmentResponseDto[]> {
    return this.enrollmentsService.getPendingEnrollments();
  }

  /**
   * GET /api/enrollments/student/:studentId
   * تسجيلات طالب معين
   */
  @Get('student/:studentId')
  async getStudentEnrollments(
    @Param('studentId') studentId: string,
    @User() user: any,
  ): Promise<EnrollmentResponseDto[]> {
    // التحقق من الصلاحية: الطالب يرى فقط تسجيلاته
    if (user.role === 'Student' && user.userId !== studentId) {
      throw new ForbiddenException('لا يمكنك عرض تسجيلات طالب آخر');
    }
    return this.enrollmentsService.getStudentEnrollments(studentId);
  }

  /**
   * GET /api/enrollments/course/:courseId
   * تسجيلات دورة معينة (للمعلم والمدير)
   */
  @Get('course/:courseId')
  @UseGuards(RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.TEACHER)
  async getCourseEnrollments(
    @Param('courseId') courseId: string,
  ): Promise<EnrollmentResponseDto[]> {
    return this.enrollmentsService.getCourseEnrollments(courseId);
  }

  /**
   * GET /api/enrollments/:id
   * تفاصيل تسجيل
   */
  @Get(':id')
  async findOne(
    @Param('id') id: string,
    @User() user: any,
  ): Promise<EnrollmentResponseDto> {
    return this.enrollmentsService.findOne(id, user);
  }

  /**
   * PUT /api/enrollments/:id/approve
   * الموافقة على تسجيل (للمدير)
   */
  @Put(':id/approve')
  @UseGuards(RolesGuard)
  @Roles(UserRole.ADMIN)
  async approveEnrollment(
    @Param('id') id: string,
    @Body('status') status: 'Approved' | 'Rejected',
    @User() user: any,
  ): Promise<EnrollmentResponseDto> {
    const adminId = user.userId || user.sub || user.id;
    return this.enrollmentsService.approveEnrollment(id, status, adminId);
  }

  /**
   * DELETE /api/enrollments/:id
   * حذف تسجيل (للمدير فقط)
   */
  @Delete(':id')
  @UseGuards(RolesGuard)
  @Roles(UserRole.ADMIN)
  async delete(@Param('id') id: string, @User() user: any): Promise<{ message: string }> {
    const adminId = user.userId || user.sub || user.id;
    await this.enrollmentsService.delete(id, adminId);
    return { message: 'تم حذف التسجيل بنجاح' };
  }
}