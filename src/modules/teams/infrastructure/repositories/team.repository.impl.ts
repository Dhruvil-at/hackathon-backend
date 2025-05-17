import { BaseRepository } from '../../../../infrastructure/database';
import { Team } from '../../domain/entities/team';
import { TeamRepository } from '../../repositories/team.repository';
import { TeamMapper } from '../../mappers/team.mapper';

interface TeamRow {
  id: number;
  name: string;
  created_at: Date;
  updated_at: Date;
  deleted_at?: Date | null;
}

export class TeamRepositoryImpl extends BaseRepository implements TeamRepository {
  /**
   * Find a team by ID
   */
  async findById(id: number): Promise<Team | null> {
    try {
      const query = `
        SELECT id, name, created_at, updated_at
        FROM hackathon.teams
        WHERE id = ? AND deleted_at IS NULL
      `;

      const teams = await this.executeQuery<TeamRow[]>('team-find-by-id', query, [id]);

      if (!teams || teams.length === 0) {
        return null;
      }

      return TeamMapper.toDomain(teams[0]);
    } catch (error) {
      console.error('Error finding team by ID:', error);
      throw new Error('Failed to find team');
    }
  }

  /**
   * Find all teams
   */
  async findAll(): Promise<Team[]> {
    try {
      const query = `
        SELECT id, name, created_at, updated_at
        FROM hackathon.teams
        WHERE deleted_at IS NULL
        ORDER BY name ASC
      `;

      const teams = await this.executeQuery<TeamRow[]>('team-find-all', query);

      if (!teams || teams.length === 0) {
        return [];
      }

      return teams.map((team) => TeamMapper.toDomain(team));
    } catch (error) {
      console.error('Error finding all teams:', error);
      throw new Error('Failed to find teams');
    }
  }

  /**
   * Create a new team
   */
  async create(team: Team): Promise<Team> {
    try {
      const teamData = TeamMapper.toPersistence(team);

      const query = `
        INSERT INTO hackathon.teams (name)
        VALUES (?)
      `;

      const result = await this.executeQuery<any>('team-create', query, [teamData.name]);

      return this.findById(result.insertId) as Promise<Team>;
    } catch (error) {
      console.error('Error creating team:', error);
      // Check for duplicate name error
      if (error instanceof Error && error.message.includes('Duplicate entry')) {
        throw new Error('Team with this name already exists');
      }
      throw new Error('Failed to create team');
    }
  }

  /**
   * Update an existing team
   */
  async update(team: Team): Promise<Team> {
    try {
      if (!team.id) {
        throw new Error('Team ID is required for update');
      }

      const teamData = TeamMapper.toPersistence(team);

      const query = `
        UPDATE hackathon.teams
        SET name = ?
        WHERE id = ? AND deleted_at IS NULL
      `;

      await this.executeQuery('team-update', query, [teamData.name, team.id]);

      return this.findById(team.id) as Promise<Team>;
    } catch (error) {
      console.error('Error updating team:', error);
      // Check for duplicate name error
      if (error instanceof Error && error.message.includes('Duplicate entry')) {
        throw new Error('Team with this name already exists');
      }
      throw new Error('Failed to update team');
    }
  }

  /**
   * Soft delete a team
   */
  async delete(id: number): Promise<boolean> {
    try {
      const query = `
        UPDATE hackathon.teams
        SET deleted_at = NOW()
        WHERE id = ? AND deleted_at IS NULL
      `;

      const result = await this.executeQuery<any>('team-delete', query, [id]);
      return result.affectedRows > 0;
    } catch (error) {
      console.error('Error deleting team:', error);
      throw new Error('Failed to delete team');
    }
  }
}
