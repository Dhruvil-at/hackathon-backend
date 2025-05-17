import { Team } from '../domain/entities/team';

interface TeamRow {
  id: number;
  name: string;
  created_at: Date;
  updated_at: Date;
  deleted_at?: Date | null;
}

export class TeamMapper {
  /**
   * Map from database row to domain entity
   */
  public static toDomain(row: TeamRow): Team {
    const props = {
      id: row.id,
      name: row.name,
      deletedAt: row.deleted_at || null,
      createdAt: row.created_at,
      updatedAt: row.updated_at,
    };
    return Team.create(props);
  }

  /**
   * Map from domain entity to database row
   */
  public static toPersistence(team: Team): Partial<TeamRow> {
    return {
      name: team.name,
      // id is handled by the database
      // timestamps are handled by the database
    };
  }
}
