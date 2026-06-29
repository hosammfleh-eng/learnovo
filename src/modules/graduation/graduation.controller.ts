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
import { GraduationService } from './graduation.service';
import { CreateGraduationDto } from './dto/create-graduation.dto';
import { UpdateGraduationDto } from './dto/update-graduation.dto';
import { GraduationResponseDto } from './dto/graduation-response.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { User } from '../../common/decorators/user.decorator';
import { UserRole } from '../../common/enums/user-role.enum';

@Controller('graduations')
@UseGuards(JwtAuthGuard)
export class GraduationController {
  constructor(private readonly graduationService: GraduationService) {}

  /**
   * POST /api/graduations
   * إنشاء طلب تخرج جديد
   */
  @Post()
  async create(
    @Body() createGraduationDto: CreateGraduationDto,
    @User() user: any,
  ): Promise<GraduationResponseDto> {
    const userId = user.userId || user.sub || user.id;
    const userRole = user.role;
    return this.graduationService.create(createGraduationDto, userId, userRole);
  }

  /**
   * GET /api/graduations
   * قائمة طلبات التخرج
   */
  @Get()
  async findAll(
    @Query('studentId') studentId?: string,
    @Query('courseId') courseId?: string,
    @Query('status') status?: string,
    @Query('teacherId') teacherId?: string,
  ): Promise<GraduationResponseDto[]> {
    return this.graduationService.findAll(studentId, courseId, status, teacherId);
  }

  /**
   * GET /api/graduations/statistics
   * إحصائيات طلبات التخرج (للمدير فقط)
   */
  @Get('statistics')
  @UseGuards(RolesGuard)
  @Roles(UserRole.ADMIN)
  async getStatistics(): Promise<any> {
    return this.graduationService.getStatistics();
  }

  /**
   * GET /api/graduations/:id
   * تفاصيل طلب تخرج
   */
  @Get(':id')
  async findOne(@Param('id') id: string): Promise<GraduationResponseDto> {
    return this.graduationService.findOne(id);
  }

  /**
   * PUT /api/graduations/:id
   * تحديث طلب تخرج
   */
  @Put(':id')
  async update(
    @Param('id') id: string,
    @Body() updateGraduationDto: UpdateGraduationDto,
    @User() user: any,
  ): Promise<GraduationResponseDto> {
    const userId = user.userId || user.sub || user.id;
    const userRole = user.role;
    return this.graduationService.update(id, updateGraduationDto, userId, userRole);
  }

  /**
   * PUT /api/graduations/:id/recommend
   * توصية المعلم لطلب التخرج (للمعلم فقط)
   */
  @Put(':id/recommend')
  @UseGuards(RolesGuard)
  @Roles(UserRole.TEACHER)
  async recommendGraduation(
    @Param('id') id: string,
    @User() user: any,
  ): Promise<GraduationResponseDto> {
    const teacherId = user.userId || user.sub || user.id;
    return this.graduationService.recommendGraduation(id, teacherId);
  }

  /**
   * PUT /api/graduations/:id/approve
   * موافقة المدير على طلب التخرج (للمدير فقط)
   */
  @Put(':id/approve')
  @UseGuards(RolesGuard)
  @Roles(UserRole.ADMIN)
  async approveGraduation(
    @Param('id') id: string,
    @Body('status') status: 'approved' | 'rejected' | 'graduated',
    @User() user: any,
  ): Promise<GraduationResponseDto> {
    const adminId = user.userId || user.sub || user.id;
    return this.graduationService.approveGraduation(id, adminId, status);
  }

  /**
   * DELETE /api/graduations/:id
   * حذف طلب تخرج (للمدير فقط)
   */
  @Delete(':id')
  @UseGuards(RolesGuard)
  @Roles(UserRole.ADMIN)
  async softDelete(@Param('id') id: string, @User() user: any): Promise<{ message: string }> {
    const userId = user.userId || user.sub || user.id;
    const userRole = user.role;
    await this.graduationService.softDelete(id, userId, userRole);
    return { message: 'تم حذف طلب التخرج بنجاح' };
  }

  /**
   * DELETE /api/graduations/:id/hard
   * حذف طلب تخرج (نهائي - للمدير فقط)
   */
  @Delete(':id/hard')
  @UseGuards(RolesGuard)
  @Roles(UserRole.ADMIN)
  async hardDelete(@Param('id') id: string, @User() user: any): Promise<{ message: string }> {
    const userId = user.userId || user.sub || user.id;
    const userRole = user.role;
    await this.graduationService.hardDelete(id, userId, userRole);
    return { message: 'تم حذف طلب التخرج نهائياً' };
  }
}