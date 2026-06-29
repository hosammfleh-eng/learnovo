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
import { GradesService } from './grades.service';
import { CreateGradeDto } from './dto/create-grade.dto';
import { UpdateGradeDto } from './dto/update-grade.dto';
import { GradeResponseDto } from './dto/grade-response.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { User } from '../../common/decorators/user.decorator';
import { UserRole } from '../../common/enums/user-role.enum';

@Controller('grades')
@UseGuards(JwtAuthGuard)
export class GradesController {
  constructor(private readonly gradesService: GradesService) {}

  /**
   * POST /api/grades
   * إدخال درجة جديدة (للمعلم فقط)
   */
  @Post()
  async create(
    @Body() createGradeDto: CreateGradeDto,
    @User() user: any,
  ): Promise<GradeResponseDto> {
    const teacherId = user.userId || user.sub || user.id;
    return this.gradesService.create(createGradeDto, teacherId);
  }

  /**
   * GET /api/grades
   * قائمة الدرجات (مع فلترة)
   */
  @Get()
  async findAll(
    @Query('studentId') studentId?: string,
    @Query('courseId') courseId?: string,
    @Query('teacherId') teacherId?: string,
    @Query('examType') examType?: string,
  ): Promise<GradeResponseDto[]> {
    return this.gradesService.findAll(studentId, courseId, teacherId, examType);
  }

  /**
   * GET /api/grades/statistics
   * إحصائيات الدرجات (للمدير فقط)
   */
  @Get('statistics')
  @UseGuards(RolesGuard)
  @Roles(UserRole.ADMIN)
  async getStatistics(): Promise<any> {
    return this.gradesService.getStatistics();
  }

  /**
   * GET /api/grades/student/:studentId
   * درجات طالب معين
   */
  @Get('student/:studentId')
  async getStudentGrades(@Param('studentId') studentId: string): Promise<GradeResponseDto[]> {
    return this.gradesService.getStudentGrades(studentId);
  }

  /**
   * GET /api/grades/course/:courseId
   * درجات دورة معينة
   */
  @Get('course/:courseId')
  async getCourseGrades(@Param('courseId') courseId: string): Promise<GradeResponseDto[]> {
    return this.gradesService.getCourseGrades(courseId);
  }

  /**
   * GET /api/grades/gpa/:studentId
   * حساب المعدل التراكمي للطالب
   */
  @Get('gpa/:studentId')
  async calculateStudentGPA(@Param('studentId') studentId: string): Promise<any> {
    return this.gradesService.calculateStudentGPA(studentId);
  }

  /**
   * GET /api/grades/:id
   * تفاصيل درجة
   */
  @Get(':id')
  async findOne(@Param('id') id: string): Promise<GradeResponseDto> {
    return this.gradesService.findOne(id);
  }

  /**
   * PUT /api/grades/:id
   * تحديث درجة (للمعلم فقط)
   */
  @Put(':id')
  async update(
    @Param('id') id: string,
    @Body() updateGradeDto: UpdateGradeDto,
    @User() user: any,
  ): Promise<GradeResponseDto> {
    const teacherId = user.userId || user.sub || user.id;
    return this.gradesService.update(id, updateGradeDto, teacherId);
  }
  @Put(':id/admin')
  @UseGuards(RolesGuard)
  @Roles(UserRole.ADMIN)
  async updateByAdmin(
    @Param('id') id: string,
    @Body() updateGradeDto: UpdateGradeDto,
    @User() user: any,
  ): Promise<GradeResponseDto> {
    const adminId = user.userId || user.sub || user.id;
    return this.gradesService.updateByAdmin(id, updateGradeDto, adminId);
  }
  /**
   * DELETE /api/grades/:id
   * حذف درجة (للمعلم فقط)
   */
  @Delete(':id')
  async delete(@Param('id') id: string, @User() user: any): Promise<{ message: string }> {
    const teacherId = user.userId || user.sub || user.id;
    await this.gradesService.delete(id, teacherId);
    return { message: 'تم حذف الدرجة بنجاح' };
  }
}