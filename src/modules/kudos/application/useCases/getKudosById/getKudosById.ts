import { KudosRepository } from '../../../repositories/kudos.repository';
import { GetKudosByIdRequestDto } from './getKudosByIdRequestDto';
import { GetKudosByIdResponseDto } from './getKudosByIdResponseDto';
import { GetKudosByIdMapper } from './getKudosByIdMapper';
import { HttpError } from '../../../../../shared/middleware/error-handler';

export class GetKudosByIdUseCase {
  constructor(private kudosRepository: KudosRepository) {}

  async execute(dto: GetKudosByIdRequestDto): Promise<GetKudosByIdResponseDto> {
    const kudos = await this.kudosRepository.findById(dto.id);

    if (!kudos) {
      throw new HttpError('Kudos not found', 404);
    }

    return GetKudosByIdMapper.toDto(kudos);
  }
}
