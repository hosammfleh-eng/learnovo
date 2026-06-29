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
import { CourseService } from './course.service';
import { CreateCourseDto } from './dto/create-course.dto';
import { UpdateCourseDto } from './dto/update-course.dto';
import { CourseResponseDto } from './dto/course-response.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { User } from '../../common/decorators/user.decorator';
import { UserRole } from '../../common/enums/user-role.enum';
import { CourseStatus } from './entities/course.entity';

@Controller('courses')
export class CourseController {
  constructor(private readonly coursesService: CourseService) {}

  /**
   * POST /api/courses
   * إنشاء دورة جديدة (للمدير فقط)
   */
  @Post()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  async create(
    @Body() createCourseDto: CreateCourseDto,
    @User() user: any,
  ): Promise<CourseResponseDto> {
    const adminId = user.userId || user.sub || user.id;
    return this.coursesService.create(createCourseDto, adminId);
  }

  /**
   * GET /api/courses
   * قائمة جميع الدورات (مع فلترة)
   */
  @Get()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  async findAll(@Query('status') status?: string): Promise<CourseResponseDto[]> {
    return this.coursesService.findAll(status);
  }

  /**
   * GET /api/courses/available
   * الدورات المتاحة للتسجيل (للطلاب والمعلمين)
   */
  @Get('available')
  async getAvailableCourses(): Promise<CourseResponseDto[]> {
    return this.coursesService.getAvailableCourses();
  }

  /**
   * GET /api/courses/statistics
   * إحصائيات الدورات
   */
  @Get('statistics')
  async getStatistics(): Promise<any> {
    return this.coursesService.getStatistics();
  }

  /**
   * GET /api/courses/teacher/:teacherId
   * دورات معلم معين
   */
  @Get('teacher/:teacherId')
  @UseGuards(JwtAuthGuard)
  async getTeacherCourses(@Param('teacherId') teacherId: string): Promise<CourseResponseDto[]> {
    return this.coursesService.getTeacherCourses(teacherId);
  }

  /**
   * GET /api/courses/student/:studentId
   * دورات طالب معين
   */
  @Get('student/:studentId')
  @UseGuards(JwtAuthGuard)
  async getStudentCourses(@Param('studentId') studentId: string): Promise<CourseResponseDto[]> {
    return this.coursesService.getStudentCourses(studentId);
  }

  /**
   * GET /api/courses/:id
   * تفاصيل دورة
   */
  @Get(':id')
  async findOne(@Param('id') id: string): Promise<CourseResponseDto> {
    return this.coursesService.findOne(id);
  }

  /**
   * PUT /api/courses/:id
   * تحديث دورة (للمدير فقط)
   */
  @Put(':id')
  @UseGuards(RolesGuard)
  @Roles(UserRole.ADMIN)
  async update(
    @Param('id') id: string,
    @Body() updateCourseDto: UpdateCourseDto,
    @User() user: any,
  ): Promise<CourseResponseDto> {
    const adminId = user.userId || user.sub || user.id;
    return this.coursesService.update(id, updateCourseDto, adminId);
  }

  /**
   * PUT /api/courses/:id/status
   * تحديث حالة الدورة (للمدير فقط)
   */
  @Put(':id/status')
  @UseGuards(RolesGuard)
  @Roles(UserRole.ADMIN)
  async updateStatus(
    @Param('id') id: string,
    @Body('status') status: CourseStatus,
    @User() user: any,
  ): Promise<CourseResponseDto> {
    const adminId = user.userId || user.sub || user.id;
    return this.coursesService.updateStatus(id, status, adminId);
  }

  /**
   * DELETE /api/courses/:id
   * حذف دورة (للمدير فقط)
   */
  @Delete(':id')
  @UseGuards(RolesGuard)
  @Roles(UserRole.ADMIN)
  async remove(@Param('id') id: string, @User() user: any): Promise<{ message: string }> {
    const adminId = user.userId || user.sub || user.id;
    await this.coursesService.remove(id, adminId);
    return { message: 'تم حذف الدورة بنجاح' };
  }
}