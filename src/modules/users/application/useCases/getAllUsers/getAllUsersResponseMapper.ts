import { User } from 'src/modules/users/domain/entities/user';
import { UserDto } from 'src/modules/users/interfaces/userDto';

export class GetAllUsersResponseMapper {
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
}
