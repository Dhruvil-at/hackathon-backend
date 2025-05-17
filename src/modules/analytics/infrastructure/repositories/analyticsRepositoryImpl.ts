import { BaseRepository } from '../../../../infrastructure/database';
import { TopTeam, TopCategory, TimePeriod, Stats } from '../../domain/interfaces/analyticsTypes';
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
          hackathon.kudos k ON k.teamId = t.id
        WHERE 
          t.deleted_at IS NULL 
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

  async getStats(period: TimePeriod): Promise<Stats> {
    try {
      // Define the time constraint based on period
      const kudosTimeConstraint = this.getKudosTimeConstraint(period);

      // Query to get total kudos count
      const kudosQuery = `
        SELECT 
          COUNT(id) as totalKudos
        FROM 
          hackathon.kudos
        WHERE 
          deletedAt IS NULL
          ${kudosTimeConstraint}
      `;

      // Query to get total active teams count
      const teamsQuery = `
        SELECT 
          COUNT(id) as totalTeams
        FROM 
          hackathon.teams
        WHERE 
          deleted_at IS NULL
      `;

      // Query to get total active categories count
      const categoriesQuery = `
        SELECT 
          COUNT(id) as totalCategories
        FROM 
          hackathon.categories
        WHERE 
          deleted_at IS NULL
      `;

      // Execute all queries in parallel
      const [kudosResults, teamsResults, categoriesResults] = await Promise.all([
        this.executeQuery<any[]>('analytics-total-kudos', kudosQuery),
        this.executeQuery<any[]>('analytics-total-teams', teamsQuery),
        this.executeQuery<any[]>('analytics-total-categories', categoriesQuery),
      ]);

      // Default values in case of empty results
      const totalKudos =
        kudosResults && kudosResults.length > 0 ? parseInt(kudosResults[0].totalKudos) || 0 : 0;
      const totalTeams =
        teamsResults && teamsResults.length > 0 ? parseInt(teamsResults[0].totalTeams) || 0 : 0;
      const totalCategories =
        categoriesResults && categoriesResults.length > 0
          ? parseInt(categoriesResults[0].totalCategories) || 0
          : 0;

      return {
        totalKudos,
        totalTeams,
        totalCategories,
      };
    } catch (error) {
      console.error('Error getting stats:', error);
      throw new Error('Failed to get statistics');
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

  private getKudosTimeConstraint(period: TimePeriod): string {
    switch (period) {
      case TimePeriod.WEEKLY:
        return 'AND createdAt >= DATE_SUB(NOW(), INTERVAL 1 WEEK)';
      case TimePeriod.MONTHLY:
        return 'AND createdAt >= DATE_SUB(NOW(), INTERVAL 1 MONTH)';
      case TimePeriod.QUARTERLY:
        return 'AND createdAt >= DATE_SUB(NOW(), INTERVAL 3 MONTH)';
      case TimePeriod.YEARLY:
        return 'AND createdAt >= DATE_SUB(NOW(), INTERVAL 1 YEAR)';
      case TimePeriod.ALL_TIME:
      default:
        return '';
    }
  }
}
