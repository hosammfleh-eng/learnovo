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
import { TeacherAssignmentService } from './teacher-assignment.service';
import { AssignTeacherDto } from './dto/create-teacher-assignment.dto';
import { UpdateAssignmentDto } from './dto/update-teacher-assignment.dto';
import { TeacherAssignmentResponseDto } from './dto/teacher-assignment-response.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { User } from '../../common/decorators/user.decorator';
import { UserRole } from '../../common/enums/user-role.enum';

@Controller('teacher-assignments')
@UseGuards(JwtAuthGuard)
export class TeacherAssignmentController {
  constructor(private readonly assignmentService: TeacherAssignmentService) {}

  /**
   * POST /api/teacher-assignments
   * إسناد معلم لدورة (للمدير فقط)
   */
  @Post()
  @UseGuards(RolesGuard)
  @Roles(UserRole.ADMIN)
  async assignTeacher(
    @Body() assignTeacherDto: AssignTeacherDto,
    @User() user: any,
  ): Promise<TeacherAssignmentResponseDto> {
    const adminId = user.userId || user.sub || user.id;
    return this.assignmentService.assignTeacher(assignTeacherDto, adminId);
  }

  /**
   * GET /api/teacher-assignments
   * قائمة الإسنادات (مع فلترة)
   */
  @Get()
  async findAll(
    @Query('courseId') courseId?: string,
    @Query('teacherId') teacherId?: string,
    @Query('isActive') isActive?: string,
  ): Promise<TeacherAssignmentResponseDto[]> {
    const isActiveBoolean = isActive === 'true' ? true : isActive === 'false' ? false : undefined;
    return this.assignmentService.findAll(courseId, teacherId, isActiveBoolean);
  }

  /**
   * GET /api/teacher-assignments/statistics
   * إحصائيات الإسنادات (للمدير فقط)
   */
  @Get('statistics')
  @UseGuards(RolesGuard)
  @Roles(UserRole.ADMIN)
  async getStatistics(): Promise<any> {
    return this.assignmentService.getStatistics();
  }

  /**
   * GET /api/teacher-assignments/course/:courseId
   * إسنادات دورة
   */
  @Get('course/:courseId')
  async getCourseAssignments(
    @Param('courseId') courseId: string,
  ): Promise<TeacherAssignmentResponseDto[]> {
    return this.assignmentService.getCourseAssignments(courseId);
  }

  /**
   * GET /api/teacher-assignments/teacher/:teacherId
   * إسنادات معلم
   */
  @Get('teacher/:teacherId')
  async getTeacherAssignments(
    @Param('teacherId') teacherId: string,
  ): Promise<TeacherAssignmentResponseDto[]> {
    return this.assignmentService.getTeacherAssignments(teacherId);
  }

  /**
   * GET /api/teacher-assignments/:id
   * تفاصيل إسناد
   */
  @Get(':id')
  async findOne(@Param('id') id: string): Promise<TeacherAssignmentResponseDto> {
    return this.assignmentService.findOne(id);
  }

  /**
   * PUT /api/teacher-assignments/:id
   * تحديث إسناد (للمدير فقط)
   */
  @Put(':id')
  @UseGuards(RolesGuard)
  @Roles(UserRole.ADMIN)
  async update(
    @Param('id') id: string,
    @Body() updateAssignmentDto: UpdateAssignmentDto,
    @User() user: any,
  ): Promise<TeacherAssignmentResponseDto> {
    const adminId = user.userId || user.sub || user.id;
    return this.assignmentService.update(id, updateAssignmentDto, adminId);
  }

  /**
   * DELETE /api/teacher-assignments/:courseId/:teacherId
   * إلغاء إسناد معلم (للمدير فقط)
   */
  @Delete(':courseId/:teacherId')
  @UseGuards(RolesGuard)
  @Roles(UserRole.ADMIN)
  async removeAssignment(
    @Param('courseId') courseId: string,
    @Param('teacherId') teacherId: string,
    @User() user: any,
  ): Promise<{ message: string }> {
    const adminId = user.userId || user.sub || user.id;
    await this.assignmentService.removeAssignment(courseId, teacherId, adminId);
    return { message: 'تم إلغاء إسناد المعلم بنجاح' };
  }

  /**
   * DELETE /api/teacher-assignments/:id
   * حذف إسناد (للمدير فقط)
   */
  @Delete(':id')
  @UseGuards(RolesGuard)
  @Roles(UserRole.ADMIN)
  async delete(@Param('id') id: string, @User() user: any): Promise<{ message: string }> {
    const adminId = user.userId || user.sub || user.id;
    await this.assignmentService.delete(id, adminId);
    return { message: 'تم حذف الإسناد بنجاح' };
  }
}