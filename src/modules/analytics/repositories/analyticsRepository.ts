import { TimePeriod, TopTeam, TopCategory, Stats } from '../domain/interfaces/analyticsTypes';

export interface AnalyticsRepository {
  getTopTeams(period: TimePeriod, limit?: number): Promise<TopTeam[]>;
  getTopCategories(period: TimePeriod, limit?: number): Promise<TopCategory[]>;
  getStats(period: TimePeriod): Promise<Stats>;
}
