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
import { UsersService } from './users.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { UserResponseDto } from './dto/user-response.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { SelfOrAdminGuard } from '../../common/guards/self-or-admin.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { User } from '../../common/decorators/user.decorator';
import { UserRole } from '../../common/enums/user-role.enum';

@Controller('users')
@UseGuards(JwtAuthGuard)
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Post()
  @UseGuards(RolesGuard)
  @Roles(UserRole.ADMIN)
  async create(@Body() createUserDto: CreateUserDto): Promise<UserResponseDto> {
    return this.usersService.create(createUserDto);
  }

  @Get()
  @UseGuards(RolesGuard)
  @Roles(UserRole.ADMIN)
  async findAll(
    @Query('role') role?: string,
    @Query('status') status?: string,
  ): Promise<UserResponseDto[]> {
    return this.usersService.findAll(role, status);
  }

  @Get('me')
  async getProfile(@User() user: any): Promise<UserResponseDto> {
    const userId = user.userId || user.sub || user.id;
    return this.usersService.findOne(userId);
  }

  @Get('teachers')
  async getTeachers(): Promise<UserResponseDto[]> {
    return this.usersService.findByRole(UserRole.TEACHER);
  }

  @Get('students')
  async getStudents(): Promise<UserResponseDto[]> {
    return this.usersService.findByRole(UserRole.STUDENT);
  }

  @Get(':id')
  @UseGuards(SelfOrAdminGuard)
  async findOne(@Param('id') id: string): Promise<UserResponseDto> {
    return this.usersService.findOne(id);
  }

  @Put(':id')
  @UseGuards(SelfOrAdminGuard)
  async update(
    @Param('id') id: string,
    @Body() updateUserDto: UpdateUserDto,
  ): Promise<UserResponseDto> {
    return this.usersService.update(id, updateUserDto);
  }

  @Put(':id/approve')
  @UseGuards(RolesGuard)
  @Roles(UserRole.ADMIN)
  async approveUser(
    @Param('id') id: string,
    @Body('status') status: 'Active' | 'Rejected' | 'Suspended',
    @User() user: any,
  ): Promise<UserResponseDto> {
    const adminId = user.userId || user.sub || user.id;
    return this.usersService.approveUser(id, status, adminId);
  }

  @Delete(':id')
  @UseGuards(RolesGuard)
  @Roles(UserRole.ADMIN)
  async remove(@Param('id') id: string): Promise<void> {
    return this.usersService.remove(id);
  }
}