import { GetAnalyticsUseCase } from './getAnalyticsUseCase';
import { AnalyticsRepository } from '../../../repositories/analyticsRepository';
import { TimePeriod, TopTeam, TopCategory, Stats } from '../../../domain/interfaces/analyticsTypes';

describe('GetAnalyticsUseCase', () => {
  // Setup mocks
  let mockAnalyticsRepository: jest.Mocked<AnalyticsRepository>;
  let getAnalyticsUseCase: GetAnalyticsUseCase;
  let mockTopTeams: TopTeam[];
  let mockTopCategories: TopCategory[];
  let mockStats: Stats;

  beforeEach(() => {
    // Create a fresh mock for each test
    mockAnalyticsRepository = {
      getTopTeams: jest.fn(),
      getTopCategories: jest.fn(),
      getStats: jest.fn(),
    } as jest.Mocked<AnalyticsRepository>;

    // Create the use case with the mock repository
    getAnalyticsUseCase = new GetAnalyticsUseCase(mockAnalyticsRepository);

    // Create mock data for test responses
    mockTopTeams = [
      { id: 1, name: 'Team Alpha', kudosCount: 30 },
      { id: 2, name: 'Team Beta', kudosCount: 25 },
      { id: 3, name: 'Team Gamma', kudosCount: 20 },
    ];

    mockTopCategories = [
      { id: 1, name: 'Teamwork', kudosCount: 45 },
      { id: 2, name: 'Innovation', kudosCount: 35 },
      { id: 3, name: 'Excellence', kudosCount: 30 },
    ];

    mockStats = {
      totalKudos: 150,
      totalTeams: 10,
      totalCategories: 5,
    };
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  describe('execute', () => {
    it('should return analytics data with default limit when limit is not provided', async () => {
      // Arrange
      const request = { period: TimePeriod.MONTHLY };
      mockAnalyticsRepository.getTopTeams.mockResolvedValue(mockTopTeams);
      mockAnalyticsRepository.getTopCategories.mockResolvedValue(mockTopCategories);
      mockAnalyticsRepository.getStats.mockResolvedValue(mockStats);

      // Act
      const result = await getAnalyticsUseCase.execute(request);

      // Assert
      expect(mockAnalyticsRepository.getTopTeams).toHaveBeenCalledWith(TimePeriod.MONTHLY, 3);
      expect(mockAnalyticsRepository.getTopCategories).toHaveBeenCalledWith(TimePeriod.MONTHLY, 3);
      expect(mockAnalyticsRepository.getStats).toHaveBeenCalledWith(TimePeriod.MONTHLY);
      expect(result).toEqual({
        topTeams: mockTopTeams,
        topCategories: mockTopCategories,
        stats: mockStats,
        timePeriod: TimePeriod.MONTHLY,
      });
    });

    it('should use provided limit when specified', async () => {
      // Arrange
      const request = { period: TimePeriod.WEEKLY, limit: 5 };
      const limitedMockTopTeams = [
        ...mockTopTeams,
        { id: 4, name: 'Team Delta', kudosCount: 15 },
        { id: 5, name: 'Team Epsilon', kudosCount: 10 },
      ];
      const limitedMockTopCategories = [
        ...mockTopCategories,
        { id: 4, name: 'Leadership', kudosCount: 25 },
        { id: 5, name: 'Helping Hand', kudosCount: 20 },
      ];

      mockAnalyticsRepository.getTopTeams.mockResolvedValue(limitedMockTopTeams);
      mockAnalyticsRepository.getTopCategories.mockResolvedValue(limitedMockTopCategories);
      mockAnalyticsRepository.getStats.mockResolvedValue(mockStats);

      // Act
      const result = await getAnalyticsUseCase.execute(request);

      // Assert
      expect(mockAnalyticsRepository.getTopTeams).toHaveBeenCalledWith(TimePeriod.WEEKLY, 5);
      expect(mockAnalyticsRepository.getTopCategories).toHaveBeenCalledWith(TimePeriod.WEEKLY, 5);
      expect(mockAnalyticsRepository.getStats).toHaveBeenCalledWith(TimePeriod.WEEKLY);
      expect(result).toEqual({
        topTeams: limitedMockTopTeams,
        topCategories: limitedMockTopCategories,
        stats: mockStats,
        timePeriod: TimePeriod.WEEKLY,
      });
    });

    it('should handle empty results', async () => {
      // Arrange
      const request = { period: TimePeriod.YEARLY };
      const emptyTopTeams: TopTeam[] = [];
      const emptyTopCategories: TopCategory[] = [];
      const emptyStats: Stats = {
        totalKudos: 0,
        totalTeams: 0,
        totalCategories: 0,
      };

      mockAnalyticsRepository.getTopTeams.mockResolvedValue(emptyTopTeams);
      mockAnalyticsRepository.getTopCategories.mockResolvedValue(emptyTopCategories);
      mockAnalyticsRepository.getStats.mockResolvedValue(emptyStats);

      // Act
      const result = await getAnalyticsUseCase.execute(request);

      // Assert
      expect(mockAnalyticsRepository.getTopTeams).toHaveBeenCalledWith(TimePeriod.YEARLY, 3);
      expect(mockAnalyticsRepository.getTopCategories).toHaveBeenCalledWith(TimePeriod.YEARLY, 3);
      expect(mockAnalyticsRepository.getStats).toHaveBeenCalledWith(TimePeriod.YEARLY);
      expect(result).toEqual({
        topTeams: emptyTopTeams,
        topCategories: emptyTopCategories,
        stats: emptyStats,
        timePeriod: TimePeriod.YEARLY,
      });
    });

    it('should handle different time periods', async () => {
      // Arrange
      const request = { period: TimePeriod.ALL_TIME };
      mockAnalyticsRepository.getTopTeams.mockResolvedValue(mockTopTeams);
      mockAnalyticsRepository.getTopCategories.mockResolvedValue(mockTopCategories);
      mockAnalyticsRepository.getStats.mockResolvedValue(mockStats);

      // Act
      const result = await getAnalyticsUseCase.execute(request);

      // Assert
      expect(mockAnalyticsRepository.getTopTeams).toHaveBeenCalledWith(TimePeriod.ALL_TIME, 3);
      expect(mockAnalyticsRepository.getTopCategories).toHaveBeenCalledWith(TimePeriod.ALL_TIME, 3);
      expect(mockAnalyticsRepository.getStats).toHaveBeenCalledWith(TimePeriod.ALL_TIME);
      expect(result.timePeriod).toBe(TimePeriod.ALL_TIME);
    });

    it('should propagate errors from getTopTeams repository method', async () => {
      // Arrange
      const request = { period: TimePeriod.MONTHLY };
      const error = new Error('Database error during getTopTeams');
      mockAnalyticsRepository.getTopTeams.mockRejectedValueOnce(error);

      // Act & Assert
      await expect(getAnalyticsUseCase.execute(request)).rejects.toThrow(
        'Database error during getTopTeams',
      );
      expect(mockAnalyticsRepository.getTopTeams).toHaveBeenCalledWith(TimePeriod.MONTHLY, 3);
    });

    it('should propagate errors from getTopCategories repository method', async () => {
      // Arrange
      const request = { period: TimePeriod.MONTHLY };
      const error = new Error('Database error during getTopCategories');
      mockAnalyticsRepository.getTopTeams.mockResolvedValue(mockTopTeams);
      mockAnalyticsRepository.getTopCategories.mockRejectedValueOnce(error);

      // Act & Assert
      await expect(getAnalyticsUseCase.execute(request)).rejects.toThrow(
        'Database error during getTopCategories',
      );
      expect(mockAnalyticsRepository.getTopTeams).toHaveBeenCalledWith(TimePeriod.MONTHLY, 3);
      expect(mockAnalyticsRepository.getTopCategories).toHaveBeenCalledWith(TimePeriod.MONTHLY, 3);
    });

    it('should propagate errors from getStats repository method', async () => {
      // Arrange
      const request = { period: TimePeriod.MONTHLY };
      const error = new Error('Database error during getStats');
      mockAnalyticsRepository.getTopTeams.mockResolvedValue(mockTopTeams);
      mockAnalyticsRepository.getTopCategories.mockResolvedValue(mockTopCategories);
      mockAnalyticsRepository.getStats.mockRejectedValueOnce(error);

      // Act & Assert
      await expect(getAnalyticsUseCase.execute(request)).rejects.toThrow(
        'Database error during getStats',
      );
      expect(mockAnalyticsRepository.getTopTeams).toHaveBeenCalledWith(TimePeriod.MONTHLY, 3);
      expect(mockAnalyticsRepository.getTopCategories).toHaveBeenCalledWith(TimePeriod.MONTHLY, 3);
      expect(mockAnalyticsRepository.getStats).toHaveBeenCalledWith(TimePeriod.MONTHLY);
    });
  });
});
