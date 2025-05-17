import { GetTeamByIdUseCase } from './getTeamByIdUseCase';
import { TeamRepository } from '../../../repositories/team.repository';
import { GetTeamByIdDtoMapper } from './getTeamByIdDtoMapper';
import { Team } from '../../../domain/entities/team';

// Only mock external dependencies (repository)

describe('GetTeamByIdUseCase', () => {
  // Setup mocks
  let mockTeamRepository: jest.Mocked<TeamRepository>;
  let getTeamByIdUseCase: GetTeamByIdUseCase;
  let mockTeam: Team;
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
    getTeamByIdUseCase = new GetTeamByIdUseCase(mockTeamRepository);

    // Create a mock team for testing with fixed dates
    mockTeam = {
      id: 1,
      name: 'Test Team',
      createdAt: mockDate,
      updatedAt: mockDate,
    } as Team;

    // Spy on GetTeamByIdDtoMapper without mocking its implementation
    jest.spyOn(GetTeamByIdDtoMapper, 'toDto');
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  describe('execute', () => {
    it('should return team data when team exists', async () => {
      // Arrange
      const request = { id: 1 };
      mockTeamRepository.findById.mockResolvedValue(mockTeam);

      // Act
      const result = await getTeamByIdUseCase.execute(request);

      // Assert
      expect(result).toEqual({
        id: 1,
        name: 'Test Team',
        createdAt: mockDate,
        updatedAt: mockDate,
      });
      expect(mockTeamRepository.findById).toHaveBeenCalledWith(1);
      expect(GetTeamByIdDtoMapper.toDto).toHaveBeenCalledWith(mockTeam);
    });

    it('should return null when team does not exist', async () => {
      // Arrange
      const request = { id: 999 };
      mockTeamRepository.findById.mockResolvedValue(null);

      // Act
      const result = await getTeamByIdUseCase.execute(request);

      // Assert
      expect(result).toBeNull();
      expect(mockTeamRepository.findById).toHaveBeenCalledWith(999);
      expect(GetTeamByIdDtoMapper.toDto).not.toHaveBeenCalled();
    });

    it('should handle invalid input with negative ID', async () => {
      // Arrange
      const request = { id: -1 };
      mockTeamRepository.findById.mockResolvedValue(null);

      // Act
      const result = await getTeamByIdUseCase.execute(request);

      // Assert
      expect(result).toBeNull();
      expect(mockTeamRepository.findById).toHaveBeenCalledWith(-1);
      expect(GetTeamByIdDtoMapper.toDto).not.toHaveBeenCalled();
    });

    it('should propagate errors from repository', async () => {
      // Arrange
      const request = { id: 1 };
      const error = new Error('Database error');
      mockTeamRepository.findById.mockRejectedValueOnce(error);

      // Act & Assert
      await expect(getTeamByIdUseCase.execute(request)).rejects.toThrow('Database error');

      expect(mockTeamRepository.findById).toHaveBeenCalledWith(1);
      expect(GetTeamByIdDtoMapper.toDto).not.toHaveBeenCalled();
    });
  });
});
