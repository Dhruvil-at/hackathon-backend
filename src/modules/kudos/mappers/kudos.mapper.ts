import { Kudos } from '../domain/entities/kudos.entity';
import { KudosProps } from '../domain/interfaces/kudos.interfaces';

export class KudosMapper {
  static toDomain(raw: any): Kudos {
    const props: KudosProps = {
      id: raw.id,
      recipientId: raw.recipientId,
      teamId: raw.team_id,
      categoryId: raw.categoryId,
      categoryName: raw.categoryName,
      teamName: raw.teamName,
      message: raw.message,
      createdBy: raw.created_by,
      createdAt: new Date(raw.created_at),
      updatedAt: new Date(raw.updated_at),
      deletedAt: raw.deleted_at ? new Date(raw.deleted_at) : null,
    };

    return Kudos.create(props);
  }

  static toPersistence(kudos: Kudos): any {
    return {
      id: kudos.getId(),
      recipientId: kudos.getRecipientId(),
      team_id: kudos.getTeamId(),
      categoryId: kudos.getCategoryId(),
      message: kudos.getMessage(),
      created_by: kudos.getCreatedBy(),
      created_at: kudos.getCreatedAt(),
      updated_at: kudos.getUpdatedAt(),
      deleted_at: kudos.getDeletedAt(),
    };
  }

  static toDTO(kudos: Kudos, teamName?: string, categoryName?: string): any {
    return {
      id: kudos.getId(),
      recipientId: kudos.getRecipientId(),
      teamId: kudos.getTeamId(),
      teamName: teamName,
      categoryId: kudos.getCategoryId(),
      categoryName: categoryName,
      message: kudos.getMessage(),
      createdBy: kudos.getCreatedBy(),
      createdAt: kudos.getCreatedAt(),
      updatedAt: kudos.getUpdatedAt(),
    };
  }
}
