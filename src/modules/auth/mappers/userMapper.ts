import { User, UserProps } from '../domain/entities/user';
import { UserRole } from '../domain/interfaces/userRoles';

export class UserMapper {
  static toDomain(raw: any): User {
    const props: UserProps = {
      id: raw.id,
      firstName: raw.firstName,
      lastName: raw.lastName,
      email: raw.email,
      password: raw.password,
      role: raw.role as UserRole,
      teamId: raw.teamId,
      createdAt: raw.created_at ? new Date(raw.created_at) : new Date(),
      updatedAt: raw.updated_at ? new Date(raw.updated_at) : new Date(),
      deletedAt: raw.deleted_at ? new Date(raw.deleted_at) : null,
    };

    return User.create(props);
  }

  static toPersistence(user: User) {
    return {
      id: user.getId(),
      firstName: user.getFirstName(),
      lastName: user.getLastName(),
      email: user.getEmail(),
      password: user.getPassword(),
      role: user.getRole(),
      teamId: user.getTeamId(),
      created_at: user.getCreatedAt(),
      updated_at: user.getUpdatedAt(),
      deleted_at: user.getDeletedAt(),
    };
  }
}
