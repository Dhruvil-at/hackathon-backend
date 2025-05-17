export interface UserDto {
  id: number;
  firstName: string;
  lastName: string;
  email: string;
  role: string;
  teamId: number;
}

export interface SearchUsersResponseDto {
  users: UserDto[];
  found: boolean;
  count: number;
}
