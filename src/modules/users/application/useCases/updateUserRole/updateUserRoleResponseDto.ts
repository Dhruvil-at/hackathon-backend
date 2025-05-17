import { UserDto } from '../../../interfaces/userDto';

export interface UpdateUserRoleResponseDto {
  success: boolean;
  user?: UserDto;
}
