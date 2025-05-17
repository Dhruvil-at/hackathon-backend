import { UserRole } from '../../../domain/interfaces/userRoles';

export interface UpdateUserRoleRequestDto {
  userId: number;
  role: UserRole;
}
