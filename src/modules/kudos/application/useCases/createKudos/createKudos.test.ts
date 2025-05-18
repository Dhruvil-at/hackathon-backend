import { CreateKudosUseCase } from './createKudos';
import { KudosRepository } from '../../../repositories/kudos.repository';
import { Kudos } from '../../../domain/entities/kudos.entity';

describe('CreateKudosUseCase', () => {
  // Setup mocks
  let mockKudosRepository: jest.Mocked<KudosRepository>;
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

    // Create the use case with the mock repository
    createKudosUseCase = new CreateKudosUseCase(mockKudosRepository);

    // Create a mock Kudos object that the Kudos.create method would return
    mockKudos = {} as Kudos;

    // Spy on Kudos.create without mocking its implementation
    jest.spyOn(Kudos, 'create').mockReturnValue(mockKudos);
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
        createdBy: 123,
        teamId: 42,
        createdAt: mockDate,
        updatedAt: mockDate,
      });
      expect(mockKudosRepository.create).toHaveBeenCalledWith(mockKudos);
    });

    it('should throw an error if recipient ID is missing', async () => {
      // Arrange
      const userId = 123;
      const request = {
        recipientId: '',
        teamId: 42,
        categoryId: 1,
        message: 'Thank you for your help on the project!',
      };

      // Restore the original implementation for this test
      jest.spyOn(Kudos, 'create').mockRestore();

      // Act & Assert
      await expect(createKudosUseCase.execute(request, userId)).rejects.toThrow(
        'Recipient name is required',
      );

      expect(mockKudosRepository.create).not.toHaveBeenCalled();
    });

    it('should throw an error if message is too short', async () => {
      // Arrange
      const userId = 123;
      const request = {
        recipientId: 'recipient-uuid',
        teamId: 42,
        categoryId: 1,
        message: 'Thx',
      };

      // Restore the original implementation for this test
      jest.spyOn(Kudos, 'create').mockRestore();

      // Act & Assert
      await expect(createKudosUseCase.execute(request, userId)).rejects.toThrow(
        'Message must be at least 5 characters long',
      );

      expect(mockKudosRepository.create).not.toHaveBeenCalled();
    });

    it('should propagate errors from repository', async () => {
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
    });
  });
});
