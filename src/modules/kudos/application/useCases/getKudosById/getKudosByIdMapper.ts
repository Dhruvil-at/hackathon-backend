import { Kudos } from '../../../domain/entities/kudos.entity';
import { GetKudosByIdResponseDto } from './getKudosByIdResponseDto';

export class GetKudosByIdMapper {
  static toDto(kudos: Kudos): GetKudosByIdResponseDto {
    return {
      id: kudos.getId(),
      recipientId: kudos.getRecipientId(),
      recipientName: kudos.getRecipientName(),
      teamId: kudos.getTeamId(),
      teamName: kudos.getTeamName(),
      categoryId: kudos.getCategoryId(),
      categoryName: kudos.getCategoryName(),
      message: kudos.getMessage(),
      createdBy: kudos.getCreatedBy(),
      createdByName: kudos.getCreatedByName(),
      createdAt: kudos.getCreatedAt(),
      updatedAt: kudos.getUpdatedAt(),
    };
  }
}
