import { User } from '../domain/entities/user';
import { UserDto } from '../interfaces/userDto';

export class UserMapper {
  static toDto(user: User): UserDto {
    return {
      id: user.getId(),
      firstName: user.getFirstName(),
      lastName: user.getLastName(),
      email: user.getEmail(),
      role: user.getRole(),
      teamId: user.getTeamId(),
      fullName: user.getFullName(),
      createdAt: user.getCreatedAt()?.toISOString(),
      updatedAt: user.getUpdatedAt()?.toISOString(),
    };
  }

  static toDomain(raw: any): User {
    return User.create({
      id: raw.id,
      firstName: raw.firstName || raw.first_name,
      lastName: raw.lastName || raw.last_name,
      email: raw.email,
      password: raw.password,
      role: raw.role,
      teamId: raw.teamId || raw.team_id,
      createdAt:
        raw.createdAt || raw.created_at ? new Date(raw.createdAt || raw.created_at) : undefined,
      updatedAt:
        raw.updatedAt || raw.updated_at ? new Date(raw.updatedAt || raw.updated_at) : undefined,
      deletedAt: raw.deletedAt || raw.deleted_at ? new Date(raw.deletedAt || raw.deleted_at) : null,
    });
  }
}
