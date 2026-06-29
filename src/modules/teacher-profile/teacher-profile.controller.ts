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
import { TeacherProfileService } from './teacher-profile.service';
import { CreateTeacherProfileDto } from './dto/create-teacher-profile.dto';
import { UpdateTeacherProfileDto } from './dto/update-teacher-profile.dto';
import { TeacherProfileResponseDto } from './dto/teacher-profile-response.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { User } from '../../common/decorators/user.decorator';
import { UserRole } from '../../common/enums/user-role.enum';

@Controller('teacher-profile')
@UseGuards(JwtAuthGuard)
export class TeacherProfileController {
  constructor(private readonly teacherProfileService: TeacherProfileService) {}

  /**
   * POST /api/teacher-profile
   * إنشاء ملف معلم (للمدير فقط)
   */
  @Post()
  @UseGuards(RolesGuard)
  @Roles(UserRole.ADMIN)
  async create(
    @Body() createTeacherProfileDto: CreateTeacherProfileDto,
    @User() user: any,
  ): Promise<TeacherProfileResponseDto> {
    const adminId = user.userId || user.sub || user.id;
    return this.teacherProfileService.create(createTeacherProfileDto, adminId);
  }

  /**
   * GET /api/teacher-profile
   * قائمة ملفات المعلمين
   */
  @Get()
  async findAll(): Promise<TeacherProfileResponseDto[]> {
    return this.teacherProfileService.findAll();
  }

  /**
   * GET /api/teacher-profile/statistics
   * إحصائيات المعلمين (للمدير فقط)
   */
  @Get('statistics')
  @UseGuards(RolesGuard)
  @Roles(UserRole.ADMIN)
  async getStatistics(): Promise<any> {
    return this.teacherProfileService.getStatistics();
  }

  /**
   * GET /api/teacher-profile/user/:userId
   * ملف معلم بواسطة user_id
   */
  @Get('user/:userId')
  async findByUserId(@Param('userId') userId: string): Promise<TeacherProfileResponseDto> {
    return this.teacherProfileService.findByUserId(userId);
  }

  /**
   * GET /api/teacher-profile/:id
   * ملف معلم بواسطة ID
   */
  @Get(':id')
  async findOne(@Param('id') id: string): Promise<TeacherProfileResponseDto> {
    return this.teacherProfileService.findOne(id);
  }

  /**
   * PUT /api/teacher-profile/:id
   * تحديث ملف معلم (للمدير فقط)
   */
  @Put(':id')
  @UseGuards(RolesGuard)
  @Roles(UserRole.ADMIN)
  async update(
    @Param('id') id: string,
    @Body() updateTeacherProfileDto: UpdateTeacherProfileDto,
    @User() user: any,
  ): Promise<TeacherProfileResponseDto> {
    const adminId = user.userId || user.sub || user.id;
    return this.teacherProfileService.update(id, updateTeacherProfileDto, adminId);
  }

  /**
   * DELETE /api/teacher-profile/:id
   * حذف ملف معلم (للمدير فقط)
   */
  @Delete(':id')
  @UseGuards(RolesGuard)
  @Roles(UserRole.ADMIN)
  async delete(@Param('id') id: string, @User() user: any): Promise<{ message: string }> {
    const adminId = user.userId || user.sub || user.id;
    await this.teacherProfileService.delete(id, adminId);
    return { message: 'تم حذف ملف المعلم بنجاح' };
  }

  /**
   * GET /api/teacher-profile/teachers-with-profiles
   * الحصول على المعلمين مع ملفاتهم الشخصية
   */
  @Get('teachers-with-profiles')
  @UseGuards(RolesGuard)
  @Roles(UserRole.ADMIN)
  async getTeachersWithProfiles(): Promise<any[]> {
    return this.teacherProfileService.getTeachersWithProfiles();
  }

  /**
   * GET /api/teacher-profile/teacher-with-profile/:teacherId
   * الحصول على معلم مع ملفه الشخصي
   */
  @Get('teacher-with-profile/:teacherId')
  async getTeacherWithProfile(@Param('teacherId') teacherId: string): Promise<any> {
    return this.teacherProfileService.getTeacherWithProfile(teacherId);
  }
}