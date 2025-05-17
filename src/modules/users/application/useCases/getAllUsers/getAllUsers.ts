import { UserRepository, UserFilters } from '../../../repositories/userRepository';
import { GetAllUsersResponseDto } from './getAllUsersResponseDto';
import { UserRole } from '../../../domain/interfaces/userRoles';
import { GetAllUsersResponseMapper } from './getAllUsersResponseMapper';

export interface GetAllUsersRequestDto {
  role?: string;
  teamId?: number;
  page?: number;
  limit?: number;
  sortOrder?: 'asc' | 'desc';
}

export class GetAllUsers {
  constructor(private userRepository: UserRepository) {}

  async execute(request?: GetAllUsersRequestDto): Promise<GetAllUsersResponseDto> {
    // Prepare filters from request
    const filters: UserFilters = {
      ...(request?.role && { role: request.role as UserRole }),
      ...(request?.teamId && { teamId: request.teamId }),
      page: request?.page,
      limit: request?.limit,
      sortOrder: request?.sortOrder,
    };

    // Get users with filters
    const { users, total } = await this.userRepository.findAll(filters);

    // Map domain entities to DTOs
    const userDtos = users.map((user) => GetAllUsersResponseMapper.toDto(user));

    // Return response with pagination metadata
    return {
      users: userDtos,
      total,
    };
  }
}
