import { UserDto } from '../../../interfaces/userDto';

export interface GetAllUsersResponseDto {
  users: UserDto[];

  total: number;
}
