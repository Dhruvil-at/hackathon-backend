import { UserRole } from '../domain/interfaces/userRoles';

export interface UserDto {
  id: number;
  firstName: string;
  lastName: string;
  email: string;
  role: UserRole;
  teamId: number | null;
  fullName: string;
  createdAt?: string;
  updatedAt?: string;
}
