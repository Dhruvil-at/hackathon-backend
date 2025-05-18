import { CreateKudosUseCase } from './createKudos';
import { KudosRepository } from '../../../repositories/kudos.repository';
import { KudosDetailsRepository } from '../../../repositories/kudosDetailsRepository';
import { Kudos } from '../../../domain/entities/kudos.entity';
import { BasecampService } from '../../../../../shared/services/basecamp.service';

// Mock the BasecampService
jest.mock('../../../../../shared/services/basecamp.service');

describe('CreateKudosUseCase', () => {
  // Setup mocks
  let mockKudosRepository: jest.Mocked<KudosRepository>;
  let mockKudosDetailsRepository: jest.Mocked<KudosDetailsRepository>;
  let createKudosUseCase: CreateKudosUseCase;
  let mockDate: Date;
  let mockKudos: Kudos;

  beforeEach(() => {
    // Create a fixed date for consistent testing
    mockDate = new Date('2023-01-01T00:00:00Z');

    // Mock the Date constructor to return a fixed date
    jest.spyOn(global, 'Date').mockImplementation(() => mockDate as any);

    // Create a fresh mock for each test
    mockKudosRepository = {
      create: jest.fn().mockResolvedValue(undefined),
      findById: jest.fn(),
      findAll: jest.fn(),
      search: jest.fn(),
    } as jest.Mocked<KudosRepository>;

    // Create the KudosDetailsRepository mock
    mockKudosDetailsRepository = {
      getUserNameById: jest.fn().mockResolvedValue('Test User'),
      getCategoryNameById: jest.fn().mockResolvedValue('Test Category'),
      getTeamNameById: jest.fn().mockResolvedValue('Test Team'),
    } as jest.Mocked<KudosDetailsRepository>;

    // Create the use case with the mock repositories
    createKudosUseCase = new CreateKudosUseCase(mockKudosRepository, mockKudosDetailsRepository);

    // Create a mock Kudos object that the Kudos.create method would return
    mockKudos = {} as Kudos;

    // Spy on Kudos.create without mocking its implementation
    jest.spyOn(Kudos, 'create').mockReturnValue(mockKudos);

    // Mock BasecampService.sendMessage
    (BasecampService.sendMessage as jest.Mock).mockResolvedValue(undefined);
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  describe('execute', () => {
    it('should create kudos successfully with valid data', async () => {
      // Arrange
      const userId = 123;
      const request = {
        recipientId: 'recipient-uuid',
        teamId: 42,
        categoryId: 1,
        message: 'Thank you for your help on the project!',
      };

      // Act
      await createKudosUseCase.execute(request, userId);

      // Assert
      expect(Kudos.create).toHaveBeenCalledWith({
        recipientId: 'recipient-uuid',
        categoryId: 1,
        message: 'Thank you for your help on the project!',
        teamId: 42,
        createdBy: 123,
        teamId: 42,
        createdAt: mockDate,
        updatedAt: mockDate,
      });
      expect(mockKudosRepository.create).toHaveBeenCalledWith(mockKudos);
    });

    it('should send a notification to Basecamp with correct data', async () => {
      // Arrange
      const userId = 123;
      const request = {
        recipientId: 'recipient-uuid',
        teamId: 42,
        categoryId: 1,
        message: 'Thank you for your help on the project!',
      };

      // Act
      await createKudosUseCase.execute(request, userId);

      // Assert
      expect(mockKudosDetailsRepository.getUserNameById).toHaveBeenCalledWith('recipient-uuid');
      expect(mockKudosDetailsRepository.getUserNameById).toHaveBeenCalledWith(123);
      expect(mockKudosDetailsRepository.getCategoryNameById).toHaveBeenCalledWith(1);
      expect(mockKudosDetailsRepository.getTeamNameById).toHaveBeenCalledWith(42);
      expect(BasecampService.sendMessage).toHaveBeenCalled();

      // Verify the message contains all the required data
      const basecampCall = (BasecampService.sendMessage as jest.Mock).mock.calls[0][0];
      expect(basecampCall).toContain('New Kudos');
      expect(basecampCall).toContain('Thank you for your help on the project!');
      expect(basecampCall).toContain('Test User');
      expect(basecampCall).toContain('Test Category');
      expect(basecampCall).toContain('Test Team');
    });

    it('should complete successfully even if Basecamp notification fails', async () => {
      // Arrange
      const userId = 123;
      const request = {
        recipientId: 'recipient-uuid',
        teamId: 42,
        categoryId: 1,
        message: 'Thank you for your help on the project!',
      };

      // Make BasecampService.sendMessage throw an error
      (BasecampService.sendMessage as jest.Mock).mockRejectedValueOnce(new Error('Basecamp error'));

      // Spy on console.error
      jest.spyOn(console, 'error').mockImplementation(() => {});

      // Act
      await createKudosUseCase.execute(request, userId);

      // Assert
      expect(mockKudosRepository.create).toHaveBeenCalledWith(mockKudos);
      expect(console.error).toHaveBeenCalled();
      // The function should complete without throwing, despite the Basecamp error
    });

    it('should throw an error if repository operation fails', async () => {
      // Arrange
      const userId = 123;
      const request = {
        recipientId: 'recipient-uuid',
        teamId: 42,
        categoryId: 1,
        message: 'Thank you for your help on the project!',
      };
      const error = new Error('Database error');
      mockKudosRepository.create.mockRejectedValueOnce(error);

      // Act & Assert
      await expect(createKudosUseCase.execute(request, userId)).rejects.toThrow('Database error');

      expect(Kudos.create).toHaveBeenCalled();
      expect(mockKudosRepository.create).toHaveBeenCalled();
      // Basecamp should not be called if repository fails
      expect(BasecampService.sendMessage).not.toHaveBeenCalled();
    });

    it('should fall back to default values if details cannot be retrieved', async () => {
      // Arrange
      const userId = 123;
      const request = {
        recipientId: 'recipient-uuid',
        teamId: 42,
        categoryId: 1,
        message: 'Thank you for your help on the project!',
      };

      // Make details return null values
      mockKudosDetailsRepository.getUserNameById.mockResolvedValueOnce('Unknown User');
      mockKudosDetailsRepository.getCategoryNameById.mockResolvedValueOnce('Unknown Category');
      mockKudosDetailsRepository.getTeamNameById.mockResolvedValueOnce('Unknown Team');

      // Act
      await createKudosUseCase.execute(request, userId);

      // Assert
      expect(BasecampService.sendMessage).toHaveBeenCalled();

      // Verify the message contains fallback values
      const basecampCall = (BasecampService.sendMessage as jest.Mock).mock.calls[0][0];
      expect(basecampCall).toContain('Unknown User');
      expect(basecampCall).toContain('Unknown Category');
      expect(basecampCall).toContain('Unknown Team');
    });

    it('should correctly handle HTML in message content', async () => {
      // Arrange
      const userId = 123;
      const request = {
        recipientId: 'recipient-uuid',
        teamId: 42,
        categoryId: 1,
        message: '<b>Thank you</b> for your <i>help</i> on the project!',
      };

      // Act
      await createKudosUseCase.execute(request, userId);

      // Assert
      expect(BasecampService.sendMessage).toHaveBeenCalled();

      // Verify HTML is preserved in the message
      const basecampCall = (BasecampService.sendMessage as jest.Mock).mock.calls[0][0];
      expect(basecampCall).toContain('<b>Thank you</b> for your <i>help</i> on the project!');
    });

    it('should handle concurrent kudos creation properly', async () => {
      // Arrange
      const userId = 123;
      const request1 = {
        recipientId: 'recipient-1',
        teamId: 42,
        categoryId: 1,
        message: 'First kudos message',
      };

      const request2 = {
        recipientId: 'recipient-2',
        teamId: 43,
        categoryId: 2,
        message: 'Second kudos message',
      };

      // Set up different user responses for the different calls
      mockKudosDetailsRepository.getUserNameById
        .mockResolvedValueOnce('User 1') // First recipient
        .mockResolvedValueOnce('Creator') // Creator for first kudos
        .mockResolvedValueOnce('User 2') // Second recipient
        .mockResolvedValueOnce('Creator'); // Creator for second kudos

      // Act - run both concurrently
      await Promise.all([
        createKudosUseCase.execute(request1, userId),
        createKudosUseCase.execute(request2, userId),
      ]);

      // Assert
      expect(mockKudosRepository.create).toHaveBeenCalledTimes(2);
      expect(BasecampService.sendMessage).toHaveBeenCalledTimes(2);

      // Check that both messages were sent with correct data
      const basecampCalls = (BasecampService.sendMessage as jest.Mock).mock.calls;
      expect(basecampCalls[0][0]).toContain('First kudos message');
      expect(basecampCalls[1][0]).toContain('Second kudos message');
    });
  });
});
