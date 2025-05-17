import { UserRepository } from '../../../repositories/userRepository';
import { SearchUsersRequestDto } from './searchUsersRequestDto';
import { SearchUsersResponseDto } from './searchUsersResponseDto';
import { SearchUsersDtoMapper } from './searchUsersDtoMapper';

export class SearchUsersUseCase {
  constructor(private readonly userRepository: UserRepository) {}

  async execute(request: SearchUsersRequestDto): Promise<SearchUsersResponseDto> {
    const { searchText } = request;

    // Search for users by firstName or lastName
    const users = await this.userRepository.searchByName(searchText);

    // Map to response DTO using the mapper
    return SearchUsersDtoMapper.toDto(users);
  }
}
