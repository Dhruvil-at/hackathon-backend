import { AnalyticsRepository } from '../../../repositories/analyticsRepository';
import { GetAnalyticsRequestDto } from './getAnalyticsRequestDto';
import { GetAnalyticsResponseDto } from './getAnalyticsResponseDto';

export class GetAnalyticsUseCase {
  constructor(private analyticsRepository: AnalyticsRepository) {}

  async execute(request: GetAnalyticsRequestDto): Promise<GetAnalyticsResponseDto> {
    // Default limit to 3 if not provided
    const limit = request.limit || 3;

    // Get the top teams and categories in parallel
    const [topTeams, topCategories] = await Promise.all([
      this.analyticsRepository.getTopTeams(request.period, limit),
      this.analyticsRepository.getTopCategories(request.period, limit),
    ]);

    return {
      topTeams,
      topCategories,
      timePeriod: request.period,
    };
  }
}
