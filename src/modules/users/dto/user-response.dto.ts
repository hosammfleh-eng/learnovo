import { UserRole, UserStatus } from '../../../common/enums/user-role.enum';

export class UserResponseDto {
  id: string;
  full_name: string;
  email: string;
  phone?: string;
  profile_picture?: string;
  role: UserRole;
  status: UserStatus;
  last_login?: Date;
  created_at: Date;
  updated_at: Date;

  constructor(user: any) {
    this.id = user._id?.toString() || user.id;
    this.full_name = user.full_name;
    this.email = user.email;
    this.phone = user.phone;
    this.profile_picture = user.profile_picture;
    this.role = user.role;
    this.status = user.status;
    this.last_login = user.last_login;
    this.created_at = user.created_at;
    this.updated_at = user.updated_at;
  }
}