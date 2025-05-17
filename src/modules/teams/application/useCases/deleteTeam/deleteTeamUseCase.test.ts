import { DeleteTeamUseCase } from './deleteTeamUseCase';
import { TeamRepository } from '../../../repositories/team.repository';
import { DeleteTeamDtoMapper } from './deleteTeamDtoMapper';
import { Team } from '../../../domain/entities/team';

// Only mock external dependencies (repository)

describe('DeleteTeamUseCase', () => {
  // Setup mocks
  let mockTeamRepository: jest.Mocked<TeamRepository>;
  let deleteTeamUseCase: DeleteTeamUseCase;
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
    deleteTeamUseCase = new DeleteTeamUseCase(mockTeamRepository);

    // Create a mock team for testing
    mockTeam = {
      id: 1,
      name: 'Test Team',
      createdAt: new Date(),
      updatedAt: new Date(),
    } as Team;

    // Use a spy on DeleteTeamDtoMapper.toDto without changing its implementation
    jest.spyOn(DeleteTeamDtoMapper, 'toDto');
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  describe('execute', () => {
    it('should delete a team successfully when it exists', async () => {
      // Arrange
      const request = { id: 1 };
      mockTeamRepository.findById.mockResolvedValue(mockTeam);
      mockTeamRepository.delete.mockResolvedValue(true);

      // Act
      const result = await deleteTeamUseCase.execute(request);

      // Assert
      // We know exactly what the mapper returns when given 'true' input
      expect(result).toEqual({
        success: true,
        message: 'Team deleted successfully',
      });
      expect(mockTeamRepository.findById).toHaveBeenCalledWith(1);
      expect(mockTeamRepository.delete).toHaveBeenCalledWith(1);
      expect(DeleteTeamDtoMapper.toDto).toHaveBeenCalledWith(true);
    });

    it('should handle case when deletion fails', async () => {
      // Arrange
      const request = { id: 1 };
      mockTeamRepository.findById.mockResolvedValue(mockTeam);
      mockTeamRepository.delete.mockResolvedValue(false);

      // Act
      const result = await deleteTeamUseCase.execute(request);

      // Assert
      expect(result).toEqual({
        success: false,
        message: 'Failed to delete team',
      });
      expect(mockTeamRepository.findById).toHaveBeenCalledWith(1);
      expect(mockTeamRepository.delete).toHaveBeenCalledWith(1);
      expect(DeleteTeamDtoMapper.toDto).toHaveBeenCalledWith(false);
    });

    it('should throw an error if team does not exist', async () => {
      // Arrange
      const request = { id: 999 };
      mockTeamRepository.findById.mockResolvedValue(null);

      // Act & Assert
      await expect(deleteTeamUseCase.execute(request)).rejects.toThrow('Team not found');

      // Verify specific behavior
      expect(mockTeamRepository.findById).toHaveBeenCalledWith(999);
      expect(mockTeamRepository.delete).not.toHaveBeenCalled();
      expect(DeleteTeamDtoMapper.toDto).not.toHaveBeenCalled();
    });

    it('should handle invalid input with negative ID', async () => {
      // Arrange
      const request = { id: -1 };
      mockTeamRepository.findById.mockResolvedValue(null);

      // Act & Assert
      await expect(deleteTeamUseCase.execute(request)).rejects.toThrow('Team not found');

      // Verify negative IDs are still properly passed to repository
      expect(mockTeamRepository.findById).toHaveBeenCalledWith(-1);
      expect(mockTeamRepository.delete).not.toHaveBeenCalled();
    });

    it('should propagate errors from findById repository method', async () => {
      // Arrange
      const request = { id: 1 };
      const error = new Error('Database error during find');
      mockTeamRepository.findById.mockRejectedValueOnce(error);

      // Act & Assert
      await expect(deleteTeamUseCase.execute(request)).rejects.toThrow(
        'Database error during find',
      );

      // Verify error handling prevents further operations
      expect(mockTeamRepository.findById).toHaveBeenCalledWith(1);
      expect(mockTeamRepository.delete).not.toHaveBeenCalled();
      expect(DeleteTeamDtoMapper.toDto).not.toHaveBeenCalled();
    });

    it('should propagate errors from delete repository method', async () => {
      // Arrange
      const request = { id: 1 };
      mockTeamRepository.findById.mockResolvedValue(mockTeam);
      const error = new Error('Database error during delete');
      mockTeamRepository.delete.mockRejectedValueOnce(error);

      // Act & Assert
      await expect(deleteTeamUseCase.execute(request)).rejects.toThrow(
        'Database error during delete',
      );

      // Verify the execution flow
      expect(mockTeamRepository.findById).toHaveBeenCalledWith(1);
      expect(mockTeamRepository.delete).toHaveBeenCalledWith(1);
      expect(DeleteTeamDtoMapper.toDto).not.toHaveBeenCalled();
    });
  });
});
