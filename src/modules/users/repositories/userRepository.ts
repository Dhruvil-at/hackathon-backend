import { User } from '../domain/entities/user';
import { UserRole } from '../domain/interfaces/userRoles';

export interface UserFilters {
  role?: UserRole;
  teamId?: number;
  page?: number;
  limit?: number;
  sortOrder?: 'asc' | 'desc';
}

export interface UserRepository {
  findAll(filters?: UserFilters): Promise<{ users: User[]; total: number }>;
  findById(id: number): Promise<User | null>;
  updateRole(id: number, role: string): Promise<User | null>;
}
