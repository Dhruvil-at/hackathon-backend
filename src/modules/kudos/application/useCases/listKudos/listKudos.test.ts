import { ListKudosUseCase } from './listKudos';
import { KudosRepository } from '../../../repositories/kudos.repository';
import { ListKudosMapper } from './listKudosMapper';
import { Kudos } from '../../../domain/entities/kudos.entity';

describe('ListKudosUseCase', () => {
  // Setup mocks
  let mockKudosRepository: jest.Mocked<KudosRepository>;
  let listKudosUseCase: ListKudosUseCase;
  let mockKudos: Kudos[];
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
    listKudosUseCase = new ListKudosUseCase(mockKudosRepository);

    // Create mock methods for the Kudos entities
    const createMockKudos = (id: string, recipientId: string, message: string) => {
      return {
        getId: jest.fn().mockReturnValue(id),
        getRecipientId: jest.fn().mockReturnValue(recipientId),
        getRecipientName: jest.fn().mockReturnValue('John Doe'),
        getTeamId: jest.fn().mockReturnValue(42),
        getTeamName: jest.fn().mockReturnValue('Awesome Team'),
        getCategoryId: jest.fn().mockReturnValue(1),
        getCategoryName: jest.fn().mockReturnValue('Teamwork'),
        getMessage: jest.fn().mockReturnValue(message),
        getCreatedBy: jest.fn().mockReturnValue(123),
        getCreatedByName: jest.fn().mockReturnValue('Jane Smith'),
        getCreatedAt: jest.fn().mockReturnValue(mockDate),
        getUpdatedAt: jest.fn().mockReturnValue(mockDate),
      } as unknown as Kudos;
    };

    mockKudos = [
      createMockKudos('kudos-1', 'recipient-1', 'Thank you for your help!'),
      createMockKudos('kudos-2', 'recipient-2', 'Great presentation today!'),
    ];

    // Spy on the mapper without mocking its implementation
    jest.spyOn(ListKudosMapper, 'toDto');
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  describe('execute', () => {
    it('should return list of kudos with default pagination', async () => {
      // Arrange
      const request = {};
      mockKudosRepository.findAll.mockResolvedValue({ kudos: mockKudos, total: 2 });

      // Act
      const result = await listKudosUseCase.execute(request);

      // Assert
      expect(mockKudosRepository.findAll).toHaveBeenCalledWith({
        page: 1,
        limit: 10,
        recipientId: undefined,
        teamId: undefined,
        categoryId: undefined,
      });
      expect(ListKudosMapper.toDto).toHaveBeenCalledWith(mockKudos, 2, 1, 10);
      expect(result).toEqual({
        kudos: [
          {
            id: 'kudos-1',
            recipientId: 'recipient-1',
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
          },
          {
            id: 'kudos-2',
            recipientId: 'recipient-2',
            recipientName: 'John Doe',
            teamId: 42,
            teamName: 'Awesome Team',
            categoryId: 1,
            categoryName: 'Teamwork',
            message: 'Great presentation today!',
            createdBy: 123,
            createdByName: 'Jane Smith',
            createdAt: mockDate,
            updatedAt: mockDate,
          },
        ],
        total: 2,
        page: 1,
        limit: 10,
        totalPages: 1,
      });
    });

    it('should apply filters when provided', async () => {
      // Arrange
      const request = {
        recipientId: 'recipient-1',
        teamId: 42,
        categoryId: 1,
        page: 2,
        limit: 5,
      };
      mockKudosRepository.findAll.mockResolvedValue({ kudos: [mockKudos[0]], total: 6 });

      // Act
      const result = await listKudosUseCase.execute(request);

      // Assert
      expect(mockKudosRepository.findAll).toHaveBeenCalledWith({
        recipientId: 'recipient-1',
        teamId: 42,
        categoryId: 1,
        page: 2,
        limit: 5,
      });
      expect(ListKudosMapper.toDto).toHaveBeenCalledWith([mockKudos[0]], 6, 2, 5);
      expect(result).toEqual({
        kudos: [
          {
            id: 'kudos-1',
            recipientId: 'recipient-1',
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
          },
        ],
        total: 6,
        page: 2,
        limit: 5,
        totalPages: 2,
      });
    });

    it('should return empty array when no kudos exist', async () => {
      // Arrange
      const request = {};
      mockKudosRepository.findAll.mockResolvedValue({ kudos: [], total: 0 });

      // Act
      const result = await listKudosUseCase.execute(request);

      // Assert
      expect(mockKudosRepository.findAll).toHaveBeenCalled();
      expect(ListKudosMapper.toDto).toHaveBeenCalledWith([], 0, 1, 10);
      expect(result).toEqual({
        kudos: [],
        total: 0,
        page: 1,
        limit: 10,
        totalPages: 0,
      });
    });

    it('should propagate errors from repository', async () => {
      // Arrange
      const request = {};
      const error = new Error('Database error');
      mockKudosRepository.findAll.mockRejectedValueOnce(error);

      // Act & Assert
      await expect(listKudosUseCase.execute(request)).rejects.toThrow('Database error');

      expect(mockKudosRepository.findAll).toHaveBeenCalled();
      expect(ListKudosMapper.toDto).not.toHaveBeenCalled();
    });
  });
});
