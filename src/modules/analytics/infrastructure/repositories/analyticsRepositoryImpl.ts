import { BaseRepository } from '../../../../infrastructure/database';
import { TopTeam, TopCategory, TimePeriod } from '../../domain/interfaces/analyticsTypes';
import { AnalyticsRepository } from '../../repositories/analyticsRepository';

export class AnalyticsRepositoryImpl extends BaseRepository implements AnalyticsRepository {
  async getTopTeams(period: TimePeriod, limit: number = 3): Promise<TopTeam[]> {
    try {
      // Define the time constraint based on period
      const timeConstraint = this.getTimeConstraint(period);

      const query = `
        SELECT 
          t.id, 
          t.name, 
          COUNT(k.id) as kudosCount
        FROM 
          hackathon.teams t
        INNER JOIN 
          hackathon.user u ON u.teamId = t.id
        INNER JOIN 
          hackathon.kudos k ON k.recipientId = u.id
        WHERE 
          t.deleted_at IS NULL 
          AND u.deleted_at IS NULL 
          AND k.deletedAt IS NULL
          ${timeConstraint}
        GROUP BY 
          t.id, t.name
        ORDER BY 
          kudosCount DESC
        LIMIT ?
      `;

      const teams = await this.executeQuery<any[]>('analytics-top-teams', query, [limit]);

      if (!teams || teams.length === 0) {
        return [];
      }

      return teams.map((team) => ({
        id: team.id,
        name: team.name,
        kudosCount: parseInt(team.kudosCount) || 0,
      }));
    } catch (error) {
      console.error('Error getting top teams:', error);
      throw new Error('Failed to get top teams');
    }
  }

  async getTopCategories(period: TimePeriod, limit: number = 3): Promise<TopCategory[]> {
    try {
      // Define the time constraint based on period
      const timeConstraint = this.getTimeConstraint(period);

      const query = `
        SELECT 
          c.id, 
          c.name, 
          COUNT(k.id) as kudosCount
        FROM 
          hackathon.categories c
        INNER JOIN 
          hackathon.kudos k ON k.categoryId = c.id
        WHERE 
          c.deleted_at IS NULL 
          AND k.deletedAt IS NULL
          ${timeConstraint}
        GROUP BY 
          c.id, c.name
        ORDER BY 
          kudosCount DESC
        LIMIT ?
      `;

      const categories = await this.executeQuery<any[]>('analytics-top-categories', query, [limit]);

      if (!categories || categories.length === 0) {
        return [];
      }

      return categories.map((category) => ({
        id: category.id,
        name: category.name,
        kudosCount: parseInt(category.kudosCount) || 0,
      }));
    } catch (error) {
      console.error('Error getting top categories:', error);
      throw new Error('Failed to get top categories');
    }
  }

  private getTimeConstraint(period: TimePeriod): string {
    switch (period) {
      case TimePeriod.WEEKLY:
        return 'AND k.createdAt >= DATE_SUB(NOW(), INTERVAL 1 WEEK)';
      case TimePeriod.MONTHLY:
        return 'AND k.createdAt >= DATE_SUB(NOW(), INTERVAL 1 MONTH)';
      case TimePeriod.QUARTERLY:
        return 'AND k.createdAt >= DATE_SUB(NOW(), INTERVAL 3 MONTH)';
      case TimePeriod.YEARLY:
        return 'AND k.createdAt >= DATE_SUB(NOW(), INTERVAL 1 YEAR)';
      case TimePeriod.ALL_TIME:
      default:
        return '';
    }
  }
}
