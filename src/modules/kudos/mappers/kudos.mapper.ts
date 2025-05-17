import { Kudos } from '../domain/entities/kudos.entity';
import { KudosProps } from '../domain/interfaces/kudos.interfaces';

export class KudosMapper {
  static toDomain(raw: any): Kudos {
    const props: KudosProps = {
      id: raw.id,
      recipientId: raw.recipientId,
      recipientName: raw.recipientName,
      teamId: raw.teamId,
      categoryId: raw.categoryId,
      categoryName: raw.categoryName,
      teamName: raw.teamName,
      message: raw.message,
      createdBy: raw.createdBy,
      createdByName: raw.createdByName,
      createdAt: new Date(raw.createdAt),
      updatedAt: new Date(raw.updatedAt),
      deletedAt: raw.deletedAt ? new Date(raw.deletedAt) : null,
    };

    return Kudos.create(props);
  }

  static toPersistence(kudos: Kudos): any {
    return {
      id: kudos.getId(),
      recipientId: kudos.getRecipientId(),
      teamId: kudos.getTeamId(),
      categoryId: kudos.getCategoryId(),
      message: kudos.getMessage(),
      createdBy: kudos.getCreatedBy(),
      createdAt: kudos.getCreatedAt(),
      updatedAt: kudos.getUpdatedAt(),
      deletedAt: kudos.getDeletedAt(),
    };
  }

  static toDTO(kudos: Kudos, teamName?: string, categoryName?: string): any {
    return {
      id: kudos.getId(),
      recipientId: kudos.getRecipientId(),
      recipientName: kudos.getRecipientName(),
      teamId: kudos.getTeamId(),
      teamName: teamName || kudos.getTeamName(),
      categoryId: kudos.getCategoryId(),
      categoryName: categoryName || kudos.getCategoryName(),
      message: kudos.getMessage(),
      createdBy: kudos.getCreatedBy(),
      createdByName: kudos.getCreatedByName(),
      createdAt: kudos.getCreatedAt(),
      updatedAt: kudos.getUpdatedAt(),
    };
  }
}
