import { TopTeam, TopCategory, Stats } from '../../../domain/interfaces/analyticsTypes';

export interface GetAnalyticsResponseDto {
  topTeams: TopTeam[];
  topCategories: TopCategory[];
  stats: Stats;
  timePeriod: string;
}
