import { GetKudosByIdUseCase } from './getKudosById';
import { KudosRepository } from '../../../repositories/kudos.repository';
import { GetKudosByIdMapper } from './getKudosByIdMapper';
import { Kudos } from '../../../domain/entities/kudos.entity';
import { HttpError } from '../../../../../shared/middleware/error-handler';

describe('GetKudosByIdUseCase', () => {
  // Setup mocks
  let mockKudosRepository: jest.Mocked<KudosRepository>;
  let getKudosByIdUseCase: GetKudosByIdUseCase;
  let mockKudos: Kudos;
  let mockDate: Date;

  beforeEach(() => {
    // Create a fixed date for consistent testing
    mockDate = new Date('2023-01-01T00:00:00Z');

    // Create a fresh mock for each test
    mockKudosRepository = {
      create: jest.fn(),
      findById: jest.fn(),
      findAll: jest.fn(),
      search: jest.fn(),
    } as jest.Mocked<KudosRepository>;

    // Create the use case with the mock repository
    getKudosByIdUseCase = new GetKudosByIdUseCase(mockKudosRepository);

    // Create mock methods for the Kudos entity
    mockKudos = {
      getId: jest.fn().mockReturnValue('kudos-123'),
      getRecipientId: jest.fn().mockReturnValue('recipient-uuid'),
      getRecipientName: jest.fn().mockReturnValue('John Doe'),
      getTeamId: jest.fn().mockReturnValue(42),
      getTeamName: jest.fn().mockReturnValue('Awesome Team'),
      getCategoryId: jest.fn().mockReturnValue(1),
      getCategoryName: jest.fn().mockReturnValue('Teamwork'),
      getMessage: jest.fn().mockReturnValue('Thank you for your help!'),
      getCreatedBy: jest.fn().mockReturnValue(123),
      getCreatedByName: jest.fn().mockReturnValue('Jane Smith'),
      getCreatedAt: jest.fn().mockReturnValue(mockDate),
      getUpdatedAt: jest.fn().mockReturnValue(mockDate),
    } as unknown as Kudos;

    // Spy on the mapper without mocking its implementation
    jest.spyOn(GetKudosByIdMapper, 'toDto');
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  describe('execute', () => {
    it('should return kudos data when it exists', async () => {
      // Arrange
      const request = { id: 'kudos-123' };
      mockKudosRepository.findById.mockResolvedValue(mockKudos);

      // Act
      const result = await getKudosByIdUseCase.execute(request);

      // Assert
      expect(mockKudosRepository.findById).toHaveBeenCalledWith('kudos-123');
      expect(GetKudosByIdMapper.toDto).toHaveBeenCalledWith(mockKudos);
      expect(result).toEqual({
        id: 'kudos-123',
        recipientId: 'recipient-uuid',
        recipientName: 'John Doe',
        teamId: 42,
        teamName: 'Awesome Team',
        categoryId: 1,
        categoryName: 'Teamwork',
        message: 'Thank you for your help!',
        createdBy: 123,
        createdByName: 'Jane Smith',
        createdAt: mockDate,
        updatedAt: mockDate,
      });
    });

    it('should throw a 404 error when kudos does not exist', async () => {
      // Arrange
      const request = { id: 'non-existent-id' };
      mockKudosRepository.findById.mockResolvedValue(null);

      // Act & Assert
      await expect(getKudosByIdUseCase.execute(request)).rejects.toThrow(HttpError);
      await expect(getKudosByIdUseCase.execute(request)).rejects.toMatchObject({
        message: 'Kudos not found',
        statusCode: 404,
      });

      expect(mockKudosRepository.findById).toHaveBeenCalledWith('non-existent-id');
      expect(GetKudosByIdMapper.toDto).not.toHaveBeenCalled();
    });

    it('should propagate errors from repository', async () => {
      // Arrange
      const request = { id: 'kudos-123' };
      const error = new Error('Database error');
      mockKudosRepository.findById.mockRejectedValueOnce(error);

      // Act & Assert
      await expect(getKudosByIdUseCase.execute(request)).rejects.toThrow('Database error');

      expect(mockKudosRepository.findById).toHaveBeenCalledWith('kudos-123');
      expect(GetKudosByIdMapper.toDto).not.toHaveBeenCalled();
    });
  });
});
