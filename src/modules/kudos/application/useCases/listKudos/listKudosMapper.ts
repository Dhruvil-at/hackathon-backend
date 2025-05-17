import { Kudos } from '../../../domain/entities/kudos.entity';
import { KudosItemDto, ListKudosResponseDto } from './listKudosResponseDto';

export class ListKudosMapper {
  static toDto(kudos: Kudos[], total: number, page: number, limit: number): ListKudosResponseDto {
    const kudosList: KudosItemDto[] = kudos.map((kudos) => ({
      id: kudos.getId(),
      recipientId: kudos.getRecipientId(),
      recipientName: kudos.getRecipientName(),
      teamId: kudos.getTeamId(),
      categoryId: kudos.getCategoryId(),
      categoryName: kudos.getCategoryName(),
      teamName: kudos.getTeamName(),
      message: kudos.getMessage(),
      createdBy: kudos.getCreatedBy(),
      createdByName: kudos.getCreatedByName(),
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

  static toItemDto(kudos: Kudos): KudosItemDto {
    return {
      id: kudos.getId(),
      recipientId: kudos.getRecipientId(),
      recipientName: kudos.getRecipientName(),
      teamId: kudos.getTeamId(),
      categoryId: kudos.getCategoryId(),
      categoryName: kudos.getCategoryName(),
      teamName: kudos.getTeamName(),
      message: kudos.getMessage(),
      createdBy: kudos.getCreatedBy(),
      createdByName: kudos.getCreatedByName(),
      createdAt: kudos.getCreatedAt(),
      updatedAt: kudos.getUpdatedAt(),
    };
  }
}
