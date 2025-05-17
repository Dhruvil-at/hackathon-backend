import { UserRole } from '../../../domain/interfaces/userRoles';

export interface LoginResponseDto {
  id: number;
  firstName: string;
  lastName: string;
  fullName: string;
  email: string;
  role: UserRole;
  teamId: number | null;
}
