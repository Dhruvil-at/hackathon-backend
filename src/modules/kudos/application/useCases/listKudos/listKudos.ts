import { KudosRepository } from '../../../repositories/kudos.repository';
import { ListKudosRequestDto } from './listKudosRequestDto';
import { ListKudosResponseDto } from './listKudosResponseDto';
import { ListKudosMapper } from './listKudosMapper';

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

    return ListKudosMapper.toDto(kudos, total, page, limit);
  }
}
