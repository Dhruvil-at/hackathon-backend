import { Kudos } from '../../../domain/entities/kudos.entity';
import { CreateKudosResponseDto } from './createKudosResponseDto';

export class CreateKudosMapper {
  static toDto(kudos: Kudos): CreateKudosResponseDto {
    return {
      id: kudos.getId(),
      recipientId: kudos.getRecipientId(),
      teamId: kudos.getTeamId(),
      categoryId: kudos.getCategoryId(),
      message: kudos.getMessage(),
      createdBy: kudos.getCreatedBy(),
      createdAt: kudos.getCreatedAt(),
    };
  }
}
