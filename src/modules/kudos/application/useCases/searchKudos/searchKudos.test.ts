import { SearchKudosUseCase } from './searchKudos';
import { KudosRepository } from '../../../repositories/kudos.repository';
import { SearchKudosMapper } from './searchKudosMapper';
import { Kudos } from '../../../domain/entities/kudos.entity';

describe('SearchKudosUseCase', () => {
  // Setup mocks
  let mockKudosRepository: jest.Mocked<KudosRepository>;
  let searchKudosUseCase: SearchKudosUseCase;
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
    searchKudosUseCase = new SearchKudosUseCase(mockKudosRepository);

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
    jest.spyOn(SearchKudosMapper, 'toDto');
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  describe('execute', () => {
    it('should return search results with default pagination', async () => {
      // Arrange
      const request = { query: 'thank' };
      mockKudosRepository.search.mockResolvedValue({ kudos: [mockKudos[0]], total: 1 });

      // Act
      const result = await searchKudosUseCase.execute(request);

      // Assert
      expect(mockKudosRepository.search).toHaveBeenCalledWith('thank', {
        query: 'thank',
        page: 1,
        limit: 10,
        teamId: undefined,
        categoryId: undefined,
      });
      expect(SearchKudosMapper.toDto).toHaveBeenCalledWith([mockKudos[0]], 1);
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
        total: 1,
      });
    });

    it('should apply filters when provided', async () => {
      // Arrange
      const request = {
        query: 'great',
        teamId: 42,
        categoryId: 1,
        page: 2,
        limit: 5,
      };
      mockKudosRepository.search.mockResolvedValue({ kudos: [mockKudos[1]], total: 1 });

      // Act
      const result = await searchKudosUseCase.execute(request);

      // Assert
      expect(mockKudosRepository.search).toHaveBeenCalledWith('great', {
        query: 'great',
        teamId: 42,
        categoryId: 1,
        page: 2,
        limit: 5,
      });
      expect(SearchKudosMapper.toDto).toHaveBeenCalledWith([mockKudos[1]], 1);
      expect(result).toEqual({
        kudos: [
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
        total: 1,
      });
    });

    it('should return empty array when no kudos match search', async () => {
      // Arrange
      const request = { query: 'nonexistent' };
      mockKudosRepository.search.mockResolvedValue({ kudos: [], total: 0 });

      // Act
      const result = await searchKudosUseCase.execute(request);

      // Assert
      expect(mockKudosRepository.search).toHaveBeenCalled();
      expect(SearchKudosMapper.toDto).toHaveBeenCalledWith([], 0);
      expect(result).toEqual({
        kudos: [],
        total: 0,
      });
    });

    it('should propagate errors from repository', async () => {
      // Arrange
      const request = { query: 'thank' };
      const error = new Error('Database error');
      mockKudosRepository.search.mockRejectedValueOnce(error);

      // Act & Assert
      await expect(searchKudosUseCase.execute(request)).rejects.toThrow('Database error');

      expect(mockKudosRepository.search).toHaveBeenCalled();
      expect(SearchKudosMapper.toDto).not.toHaveBeenCalled();
    });
  });
});
