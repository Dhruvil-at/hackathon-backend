import { UpdateTeamUseCase } from './updateTeamUseCase';
import { TeamRepository } from '../../../repositories/team.repository';
import { Team } from '../../../domain/entities/team';

// Only mock external dependencies (repository)

describe('UpdateTeamUseCase', () => {
  // Setup mocks
  let mockTeamRepository: jest.Mocked<TeamRepository>;
  let updateTeamUseCase: UpdateTeamUseCase;
  let mockTeam: Team;

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
    updateTeamUseCase = new UpdateTeamUseCase(mockTeamRepository);

    // Create a mock team with update method
    mockTeam = {
      id: 1,
      name: 'Original Team Name',
      createdAt: new Date(),
      updatedAt: new Date(),
      update: jest.fn(),
    } as unknown as Team;
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  describe('execute', () => {
    it('should update a team successfully when it exists', async () => {
      // Arrange
      const request = { id: 1, name: 'Updated Team Name' };
      mockTeamRepository.findById.mockResolvedValue(mockTeam);
      mockTeamRepository.update.mockResolvedValue();

      // Act
      await updateTeamUseCase.execute(request);

      // Assert
      expect(mockTeamRepository.findById).toHaveBeenCalledWith(1);
      expect(mockTeam.update).toHaveBeenCalledWith('Updated Team Name');
      expect(mockTeamRepository.update).toHaveBeenCalledWith(mockTeam);
    });

    it('should trim whitespace from team name', async () => {
      // Arrange
      const request = { id: 1, name: '  Team With Spaces  ' };
      mockTeamRepository.findById.mockResolvedValue(mockTeam);
      mockTeamRepository.update.mockResolvedValue();

      // Act
      await updateTeamUseCase.execute(request);

      // Assert
      expect(mockTeamRepository.findById).toHaveBeenCalledWith(1);
      expect(mockTeam.update).toHaveBeenCalledWith('Team With Spaces');
      expect(mockTeamRepository.update).toHaveBeenCalledWith(mockTeam);
    });

    it('should throw an error if name is empty', async () => {
      // Arrange
      const request = { id: 1, name: '' };

      // Act & Assert
      await expect(updateTeamUseCase.execute(request)).rejects.toThrow('Team name is required');

      expect(mockTeamRepository.findById).not.toHaveBeenCalled();
      expect(mockTeam.update).not.toHaveBeenCalled();
      expect(mockTeamRepository.update).not.toHaveBeenCalled();
    });

    it('should throw an error if name contains only whitespace', async () => {
      // Arrange
      const request = { id: 1, name: '   ' };

      // Act & Assert
      await expect(updateTeamUseCase.execute(request)).rejects.toThrow('Team name is required');

      expect(mockTeamRepository.findById).not.toHaveBeenCalled();
      expect(mockTeam.update).not.toHaveBeenCalled();
      expect(mockTeamRepository.update).not.toHaveBeenCalled();
    });

    it('should throw an error if team does not exist', async () => {
      // Arrange
      const request = { id: 999, name: 'Valid Name' };
      mockTeamRepository.findById.mockResolvedValue(null);

      // Act & Assert
      await expect(updateTeamUseCase.execute(request)).rejects.toThrow('Team not found');

      expect(mockTeamRepository.findById).toHaveBeenCalledWith(999);
      expect(mockTeam.update).not.toHaveBeenCalled();
      expect(mockTeamRepository.update).not.toHaveBeenCalled();
    });

    it('should propagate errors from findById repository method', async () => {
      // Arrange
      const request = { id: 1, name: 'Valid Name' };
      const error = new Error('Database error during find');
      mockTeamRepository.findById.mockRejectedValueOnce(error);

      // Act & Assert
      await expect(updateTeamUseCase.execute(request)).rejects.toThrow(
        'Database error during find',
      );

      expect(mockTeamRepository.findById).toHaveBeenCalledWith(1);
      expect(mockTeam.update).not.toHaveBeenCalled();
      expect(mockTeamRepository.update).not.toHaveBeenCalled();
    });

    it('should propagate errors from update repository method', async () => {
      // Arrange
      const request = { id: 1, name: 'Valid Name' };
      mockTeamRepository.findById.mockResolvedValue(mockTeam);
      const error = new Error('Database error during update');
      mockTeamRepository.update.mockRejectedValueOnce(error);

      // Act & Assert
      await expect(updateTeamUseCase.execute(request)).rejects.toThrow(
        'Database error during update',
      );

      expect(mockTeamRepository.findById).toHaveBeenCalledWith(1);
      expect(mockTeam.update).toHaveBeenCalledWith('Valid Name');
      expect(mockTeamRepository.update).toHaveBeenCalledWith(mockTeam);
    });
  });
});
