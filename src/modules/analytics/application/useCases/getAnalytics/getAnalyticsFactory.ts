import { AnalyticsRepositoryImpl } from '../../../infrastructure/repositories/analyticsRepositoryImpl';
import { GetAnalyticsUseCase } from './getAnalyticsUseCase';

export class GetAnalyticsFactory {
  static create(): GetAnalyticsUseCase {
    const analyticsRepository = new AnalyticsRepositoryImpl();
    return new GetAnalyticsUseCase(analyticsRepository);
  }
}
