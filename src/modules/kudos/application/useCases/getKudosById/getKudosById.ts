import { KudosRepository } from '../../../repositories/kudos.repository';
import { GetKudosByIdRequestDto } from './getKudosByIdRequestDto';
import { GetKudosByIdResponseDto } from './getKudosByIdResponseDto';
import { HttpError } from '../../../../../shared/middleware/error-handler';

export class GetKudosByIdUseCase {
  constructor(private kudosRepository: KudosRepository) {}

  async execute(dto: GetKudosByIdRequestDto): Promise<GetKudosByIdResponseDto> {
    const kudos = await this.kudosRepository.findById(dto.id);

    if (!kudos) {
      throw new HttpError('Kudos not found', 404);
    }

    return {
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
    };
  }
}
