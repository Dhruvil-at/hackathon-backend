import { KudosDetailsRepository } from '../../repositories/kudosDetailsRepository';
import { BaseRepository } from '../../../../infrastructure/database/base.repository';

/**
 * Implementation of KudosDetailsRepository that fetches data from the database
 * This keeps the kudos module isolated from other modules
 */
export class KudosDetailsRepositoryImpl extends BaseRepository implements KudosDetailsRepository {
  async getUserNameById(id: number | string): Promise<string> {
    try {
      const query = `
        SELECT CONCAT(firstName, ' ', lastName) as fullName
        FROM hackathon.user
        WHERE id = ? AND deleted_at IS NULL
      `;

      const result = await this.executeQuery<any[]>('getUserNameById', query, [id]);

      if (!result || result.length === 0) {
        return 'Unknown User';
      }

      return result[0].fullName;
    } catch (error) {
      console.error('Error getting user name:', error);
      return 'Unknown User';
    }
  }

  async getCategoryNameById(id: number): Promise<string> {
    try {
      const query = `
        SELECT name
        FROM hackathon.categories
        WHERE id = ? AND deleted_at IS NULL
      `;

      const result = await this.executeQuery<any[]>('getCategoryNameById', query, [id]);

      if (!result || result.length === 0) {
        return 'Unknown Category';
      }

      return result[0].name;
    } catch (error) {
      console.error('Error getting category name:', error);
      return 'Unknown Category';
    }
  }

  async getTeamNameById(id: number): Promise<string> {
    try {
      const query = `
        SELECT name
        FROM hackathon.teams
        WHERE id = ? AND deleted_at IS NULL
      `;

      const result = await this.executeQuery<any[]>('getTeamNameById', query, [id]);

      if (!result || result.length === 0) {
        return 'Unknown Team';
      }

      return result[0].name;
    } catch (error) {
      console.error('Error getting team name:', error);
      return 'Unknown Team';
    }
  }
}
