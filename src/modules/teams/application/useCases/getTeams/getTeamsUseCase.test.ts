import { GetTeamsUseCase } from './getTeamsUseCase';
import { TeamRepository } from '../../../repositories/team.repository';
import { GetTeamsDtoMapper } from './getTeamsDtoMapper';
import { Team } from '../../../domain/entities/team';

// Only mock external dependencies (repository)

describe('GetTeamsUseCase', () => {
  // Setup mocks
  let mockTeamRepository: jest.Mocked<TeamRepository>;
  let getTeamsUseCase: GetTeamsUseCase;
  let mockTeams: Team[];
  let mockDate: Date;

  beforeEach(() => {
    // Create a fixed date for consistent testing
    mockDate = new Date('2023-01-01T00:00:00Z');

    // Create a fresh mock for each test
    mockTeamRepository = {
      create: jest.fn(),
      findAll: jest.fn(),
      findById: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    } as jest.Mocked<TeamRepository>;

    // Create the use case with the mock repository
    getTeamsUseCase = new GetTeamsUseCase(mockTeamRepository);

    // Create mock teams for testing with fixed dates
    mockTeams = [
      {
        id: 1,
        name: 'Team A',
        createdAt: mockDate,
        updatedAt: mockDate,
      } as Team,
      {
        id: 2,
        name: 'Team B',
        createdAt: mockDate,
        updatedAt: mockDate,
      } as Team,
    ];

    // Spy on GetTeamsDtoMapper without mocking its implementation
    jest.spyOn(GetTeamsDtoMapper, 'toDto');
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  describe('execute', () => {
    it('should return all teams when teams exist', async () => {
      // Arrange
      mockTeamRepository.findAll.mockResolvedValue(mockTeams);

      // Act
      const result = await getTeamsUseCase.execute();

      // Assert
      expect(result).toBeDefined();
      expect(result.teams).toHaveLength(2);
      expect(result.teams[0].id).toBe(1);
      expect(result.teams[0].name).toBe('Team A');
      expect(result.teams[1].id).toBe(2);
      expect(result.teams[1].name).toBe('Team B');

      expect(mockTeamRepository.findAll).toHaveBeenCalled();
      expect(GetTeamsDtoMapper.toDto).toHaveBeenCalledWith(mockTeams);
    });

    it('should return empty array when no teams exist', async () => {
      // Arrange
      mockTeamRepository.findAll.mockResolvedValue([]);

      // Act
      const result = await getTeamsUseCase.execute();

      // Assert
      expect(result).toBeDefined();
      expect(result.teams).toHaveLength(0);

      expect(mockTeamRepository.findAll).toHaveBeenCalled();
      expect(GetTeamsDtoMapper.toDto).toHaveBeenCalledWith([]);
    });

    it('should propagate errors from repository', async () => {
      // Arrange
      const error = new Error('Database error');
      mockTeamRepository.findAll.mockRejectedValueOnce(error);

      // Act & Assert
      await expect(getTeamsUseCase.execute()).rejects.toThrow('Database error');

      expect(mockTeamRepository.findAll).toHaveBeenCalled();
      expect(GetTeamsDtoMapper.toDto).not.toHaveBeenCalled();
    });
  });
});
