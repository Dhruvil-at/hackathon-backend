import { Request, Response, NextFunction } from 'express';
import { GetAnalyticsFactory } from '../../application/useCases/getAnalytics/getAnalyticsFactory';
import { TimePeriod } from '../../domain/interfaces/analyticsTypes';

export class AnalyticsController {
  static async getAnalytics(req: Request, res: Response, next: NextFunction) {
    try {
      // Extract query parameters with defaults
      const period = (req.query.period as TimePeriod) || TimePeriod.ALL_TIME;
      const limit = req.query.limit ? parseInt(req.query.limit as string, 10) : 3;

      // Create and execute use case
      const getAnalyticsUseCase = GetAnalyticsFactory.create();
      const result = await getAnalyticsUseCase.execute({ period, limit });

      // Format the response data
      const responseData = {
        topTeams: result.topTeams.map((team) => ({
          id: team.id,
          name: team.name,
          kudosCount: team.kudosCount,
        })),
        topCategories: result.topCategories.map((category) => ({
          id: category.id,
          name: category.name,
          kudosCount: category.kudosCount,
        })),
        timePeriod: result.timePeriod,
      };

      // Return analytics data
      res.status(200).json({
        success: true,
        message: 'Analytics data retrieved successfully',
        data: responseData,
      });
      return;
    } catch (error) {
      console.error('Error retrieving analytics data:', error);
      res.status(200).json({
        success: false,
        message: error.message || 'Failed to retrieve analytics data',
        data: null,
      });
      next(error);
      return;
    }
  }
}
