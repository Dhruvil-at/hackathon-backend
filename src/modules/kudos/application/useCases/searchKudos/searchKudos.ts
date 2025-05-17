import { KudosRepository } from '../../../repositories/kudos.repository';
import { SearchKudosRequestDto } from './searchKudosRequestDto';
import { SearchKudosResponseDto } from './searchKudosResponseDto';
import { KudosItemDto } from '../listKudos/listKudosResponseDto';

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

    const kudosList: KudosItemDto[] = kudos.map((kudos) => ({
      id: kudos.getId(),
      recipientId: kudos.getRecipientId(),
      teamId: kudos.getTeamId(),
      categoryId: kudos.getCategoryId(),
      categoryName: kudos.getCategoryName(),
      teamName: kudos.getTeamName(),
      message: kudos.getMessage(),
      createdBy: kudos.getCreatedBy(),
      createdAt: kudos.getCreatedAt(),
      updatedAt: kudos.getUpdatedAt(),
    }));

    const totalPages = Math.ceil(total / limit);

    return {
      kudos: kudosList,
      total,
      page,
      limit,
      totalPages,
      query: dto.query,
    };
  }
}
