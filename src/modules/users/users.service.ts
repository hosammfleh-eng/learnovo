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
import { User } from './entities/user.entity';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { UserResponseDto } from './dto/user-response.dto';
import { UserRole, UserStatus } from '../../common/enums/user-role.enum';
import { NotificationsService } from '../notifications/notifications.service';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private userRepository: MongoRepository<User>,
    private notificationsService: NotificationsService,
  ) {}

  async create(createUserDto: CreateUserDto): Promise<UserResponseDto> {
    const existing = await this.userRepository.findOne({
      where: { email: createUserDto.email },
    });
    if (existing) {
      throw new ConflictException('البريد الإلكتروني مستخدم بالفعل');
    }

    const user = this.userRepository.create(createUserDto);
    const saved = await this.userRepository.save(user);
    return new UserResponseDto(saved);
  }

  async findAll(role?: string, status?: string): Promise<UserResponseDto[]> {
    const filter: any = {};
    if (role) filter.role = role;
    if (status) filter.status = status;
    const users = await this.userRepository.find({ where: filter });
    return users.map((u) => new UserResponseDto(u));
  }

  async findOne(id: string): Promise<UserResponseDto> {
    if (!ObjectId.isValid(id)) {
      throw new BadRequestException('معرف غير صحيح');
    }
    const user = await this.userRepository.findOne({
      where: { _id: new ObjectId(id) },
    });
    if (!user) {
      throw new NotFoundException(`المستخدم برقم ${id} غير موجود`);
    }
    return new UserResponseDto(user);
  }

  async findByEmail(email: string): Promise<User | null> {
    return this.userRepository.findOne({ where: { email } });
  }

  async findByRole(role: UserRole): Promise<UserResponseDto[]> {
    const users = await this.userRepository.find({
      where: { role, status: UserStatus.ACTIVE },
    });
    return users.map((u) => new UserResponseDto(u));
  }

  async update(
    id: string,
    updateUserDto: UpdateUserDto,
  ): Promise<UserResponseDto> {
    if (!ObjectId.isValid(id)) {
      throw new BadRequestException('معرف غير صحيح');
    }

    const user = await this.userRepository.findOne({
      where: { _id: new ObjectId(id) },
    });
    if (!user) {
      throw new NotFoundException(`المستخدم برقم ${id} غير موجود`);
    }

    // ✅ تحديث الحقول
    if (updateUserDto.full_name) user.full_name = updateUserDto.full_name;
    if (updateUserDto.email) user.email = updateUserDto.email;
    if (updateUserDto.phone) user.phone = updateUserDto.phone;
    if (updateUserDto.role) user.role = updateUserDto.role;
    if (updateUserDto.status) user.status = updateUserDto.status;
    if (updateUserDto.password_hash)
      user.password_hash = updateUserDto.password_hash;

    user.updated_at = new Date();

    const updated = await this.userRepository.save(user);
    return new UserResponseDto(updated);
  }

  async approveUser(
    id: string,
    status: 'Active' | 'Rejected' | 'Suspended',
    adminId: string,
  ): Promise<UserResponseDto> {
    if (!ObjectId.isValid(id)) {
      throw new BadRequestException('معرف غير صحيح');
    }

    const user = await this.userRepository.findOne({
      where: { _id: new ObjectId(id) },
    });
    if (!user) {
      throw new NotFoundException(`المستخدم برقم ${id} غير موجود`);
    }

    if (user.role === UserRole.ADMIN) {
      throw new ForbiddenException('لا يمكن تعديل حالة مدير');
    }

    user.status = status as UserStatus;
    user.updated_at = new Date();
    const updated = await this.userRepository.save(user);

    await this.notificationsService.notifyAccountApproval(id, status);

    return new UserResponseDto(updated);
  }

  async updateLastLogin(id: string): Promise<void> {
    if (!ObjectId.isValid(id)) return;

    // ✅ استخدام update مع الصيغة الصحيحة لـ MongoDB
    await this.userRepository.updateOne(
      { _id: new ObjectId(id) },
      { $set: { last_login: new Date() } },
    );
  }
  async remove(id: string): Promise<void> {
    if (!ObjectId.isValid(id)) {
      throw new BadRequestException('معرف غير صحيح');
    }
    const user = await this.userRepository.findOne({
      where: { _id: new ObjectId(id) },
    });
    if (!user) {
      throw new NotFoundException(`المستخدم برقم ${id} غير موجود`);
    }
    if (user.role === UserRole.ADMIN) {
      throw new ForbiddenException('لا يمكن حذف مدير');
    }
    await this.userRepository.delete({ _id: new ObjectId(id) });
  }
}
