import { KudosRepository } from '../../../repositories/kudos.repository';
import { ListKudosRequestDto } from './listKudosRequestDto';
import { KudosItemDto, ListKudosResponseDto } from './listKudosResponseDto';

export class ListKudosUseCase {
  constructor(private kudosRepository: KudosRepository) {}

  async execute(dto: ListKudosRequestDto): Promise<ListKudosResponseDto> {
    const page = dto.page || 1;
    const limit = dto.limit || 10;

    const filters = {
      recipientId: dto.recipientId,
      teamId: dto.teamId,
      categoryId: dto.categoryId,
      page,
      limit,
    };

    const { kudos, total } = await this.kudosRepository.findAll(filters);

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
    };
  }
}
