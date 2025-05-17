import { KudosRepository } from '../../../repositories/kudos.repository';
import { SearchKudosRequestDto } from './searchKudosRequestDto';
import { SearchKudosResponseDto } from './searchKudosResponseDto';
import { SearchKudosMapper } from './searchKudosMapper';

export class SearchKudosUseCase {
  constructor(private kudosRepository: KudosRepository) {}

  async execute(dto: SearchKudosRequestDto): Promise<SearchKudosResponseDto> {
    const page = dto.page || 1;
    const limit = dto.limit || 10;

    const filters = {
      query: dto.query,
      teamId: dto.teamId,
      categoryId: dto.categoryId,
      page,
      limit,
    };

    const { kudos, total } = await this.kudosRepository.search(dto.query, filters);

    return SearchKudosMapper.toDto(kudos, total);
  }
}
