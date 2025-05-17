import { AnalyticsRepository } from '../../../repositories/analyticsRepository';
import { GetAnalyticsRequestDto } from './getAnalyticsRequestDto';
import { GetAnalyticsResponseDto } from './getAnalyticsResponseDto';

export class GetAnalyticsUseCase {
  constructor(private analyticsRepository: AnalyticsRepository) {}

  async execute(request: GetAnalyticsRequestDto): Promise<GetAnalyticsResponseDto> {
    // Default limit to 3 if not provided
    const limit = request.limit || 3;

    // Get the top teams, categories, and stats in parallel
    const [topTeams, topCategories, stats] = await Promise.all([
      this.analyticsRepository.getTopTeams(request.period, limit),
      this.analyticsRepository.getTopCategories(request.period, limit),
      this.analyticsRepository.getStats(request.period),
    ]);

    return {
      topTeams,
      topCategories,
      stats,
      timePeriod: request.period,
    };
  }
}
