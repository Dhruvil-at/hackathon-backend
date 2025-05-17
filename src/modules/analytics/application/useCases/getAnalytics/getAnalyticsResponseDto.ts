import { TopTeam, TopCategory } from '../../../domain/interfaces/analyticsTypes';

export interface GetAnalyticsResponseDto {
  topTeams: TopTeam[];
  topCategories: TopCategory[];
  timePeriod: string;
}
