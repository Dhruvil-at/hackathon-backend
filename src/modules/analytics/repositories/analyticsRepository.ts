import { TimePeriod, TopTeam, TopCategory } from '../domain/interfaces/analyticsTypes';

export interface AnalyticsRepository {
  getTopTeams(period: TimePeriod, limit?: number): Promise<TopTeam[]>;
  getTopCategories(period: TimePeriod, limit?: number): Promise<TopCategory[]>;
}
