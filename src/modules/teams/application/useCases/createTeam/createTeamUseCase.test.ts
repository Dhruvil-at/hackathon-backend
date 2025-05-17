import { CreateTeamUseCase } from './createTeamUseCase';
import { TeamRepository } from '../../../repositories/team.repository';
import { Team } from '../../../domain/entities/team';

// No need to mock the Team domain entity as it's internal logic
// Only mock external dependencies (repository)

describe('CreateTeamUseCase', () => {
  // Setup mocks
  let mockTeamRepository: jest.Mocked<TeamRepository>;
  let createTeamUseCase: CreateTeamUseCase;

  beforeEach(() => {
    // Create a fresh mock for each test
    mockTeamRepository = {
      create: jest.fn(),
      findAll: jest.fn(),
      findById: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    } as jest.Mocked<TeamRepository>;

    // Create the use case with the mock repository
    createTeamUseCase = new CreateTeamUseCase(mockTeamRepository);

    // Spy on Team.create without mocking its implementation
    jest.spyOn(Team, 'create');
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  describe('execute', () => {
    it('should create a team successfully with valid name', async () => {
      // Arrange
      const request = { name: 'Test Team' };
      mockTeamRepository.create.mockResolvedValue(undefined);

      // Act
      await createTeamUseCase.execute(request);

      // Assert
      expect(Team.create).toHaveBeenCalledWith({ name: 'Test Team' });
      expect(mockTeamRepository.create).toHaveBeenCalled();
    });

    it('should trim the team name before creating', async () => {
      // Arrange
      const request = { name: '  Team with Spaces  ' };
      mockTeamRepository.create.mockResolvedValue(undefined);

      // Act
      await createTeamUseCase.execute(request);

      // Assert
      expect(Team.create).toHaveBeenCalledWith({ name: 'Team with Spaces' });
      expect(mockTeamRepository.create).toHaveBeenCalled();
    });

    it('should throw an error if name is empty', async () => {
      // Arrange
      const request = { name: '' };

      // Act & Assert
      await expect(createTeamUseCase.execute(request)).rejects.toThrow('Team name is required');

      expect(Team.create).not.toHaveBeenCalled();
      expect(mockTeamRepository.create).not.toHaveBeenCalled();
    });

    it('should throw an error if name contains only whitespace', async () => {
      // Arrange
      const request = { name: '   ' };

      // Act & Assert
      await expect(createTeamUseCase.execute(request)).rejects.toThrow('Team name is required');

      expect(Team.create).not.toHaveBeenCalled();
      expect(mockTeamRepository.create).not.toHaveBeenCalled();
    });

    it('should propagate errors from repository', async () => {
      // Arrange
      const request = { name: 'Test Team' };
      const error = new Error('Database error');
      mockTeamRepository.create.mockRejectedValueOnce(error);

      // Act & Assert
      await expect(createTeamUseCase.execute(request)).rejects.toThrow('Database error');

      expect(Team.create).toHaveBeenCalled();
      expect(mockTeamRepository.create).toHaveBeenCalled();
    });
  });
});
