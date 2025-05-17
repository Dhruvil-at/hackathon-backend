import { User } from '../../../domain/entities/user';
import { UserDto, SearchUsersResponseDto } from './searchUsersResponseDto';

export class SearchUsersDtoMapper {
  static toUserDto(user: User): UserDto {
    return {
      id: user.getId(),
      firstName: user.getFirstName(),
      lastName: user.getLastName(),
      email: user.getEmail(),
      role: user.getRole(),
      teamId: user.getTeamId() || 0,
    };
  }

  static toDto(users: User[]): SearchUsersResponseDto {
    const userDtos = users.map((user) => this.toUserDto(user));

    return {
      users: userDtos,
      found: userDtos.length > 0,
      count: userDtos.length,
    };
  }
}
