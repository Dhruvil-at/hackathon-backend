import { TimePeriod } from '../../../domain/interfaces/analyticsTypes';

export interface GetAnalyticsRequestDto {
  period: TimePeriod;
  limit?: number;
}
