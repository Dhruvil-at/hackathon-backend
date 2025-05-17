import { GetCategoryByIdUseCase } from './getCategoryByIdUseCase';
import { CategoryRepository } from '../../../repositories/category.repository';
import { GetCategoryByIdDtoMapper } from './getCategoryByIdDtoMapper';
import { Category } from '../../../domain/entities/category';

describe('GetCategoryByIdUseCase', () => {
  // Setup mocks
  let mockCategoryRepository: jest.Mocked<CategoryRepository>;
  let getCategoryByIdUseCase: GetCategoryByIdUseCase;
  let mockCategory: Category;
  let mockDate: Date;

  beforeEach(() => {
    // Create a fixed date for consistent testing
    mockDate = new Date('2023-01-01T00:00:00Z');

    // Create a fresh mock for each test
    mockCategoryRepository = {
      create: jest.fn(),
      findAll: jest.fn(),
      findById: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    } as jest.Mocked<CategoryRepository>;

    // Create the use case with the mock repository
    getCategoryByIdUseCase = new GetCategoryByIdUseCase(mockCategoryRepository);

    // Create a mock category for testing with fixed dates
    mockCategory = {
      id: 1,
      name: 'Test Category',
      createdAt: mockDate,
      updatedAt: mockDate,
    } as Category;

    // Spy on GetCategoryByIdDtoMapper without mocking its implementation
    jest.spyOn(GetCategoryByIdDtoMapper, 'toDto');
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  describe('execute', () => {
    it('should return category data when category exists', async () => {
      // Arrange
      const request = { id: 1 };
      mockCategoryRepository.findById.mockResolvedValue(mockCategory);

      // Act
      const result = await getCategoryByIdUseCase.execute(request);

      // Assert
      expect(mockCategoryRepository.findById).toHaveBeenCalledWith(1);
      expect(GetCategoryByIdDtoMapper.toDto).toHaveBeenCalledWith(mockCategory);
      expect(result).toEqual({
        id: 1,
        name: 'Test Category',
        createdAt: mockDate,
        updatedAt: mockDate,
      });
    });

    it('should return null when category does not exist', async () => {
      // Arrange
      const request = { id: 999 };
      mockCategoryRepository.findById.mockResolvedValue(null);

      // Act
      const result = await getCategoryByIdUseCase.execute(request);

      // Assert
      expect(result).toBeNull();
      expect(mockCategoryRepository.findById).toHaveBeenCalledWith(999);
      expect(GetCategoryByIdDtoMapper.toDto).not.toHaveBeenCalled();
    });

    it('should handle invalid input with negative ID', async () => {
      // Arrange
      const request = { id: -1 };
      mockCategoryRepository.findById.mockResolvedValue(null);

      // Act
      const result = await getCategoryByIdUseCase.execute(request);

      // Assert
      expect(result).toBeNull();
      expect(mockCategoryRepository.findById).toHaveBeenCalledWith(-1);
      expect(GetCategoryByIdDtoMapper.toDto).not.toHaveBeenCalled();
    });

    it('should propagate errors from repository', async () => {
      // Arrange
      const request = { id: 1 };
      const error = new Error('Database error');
      mockCategoryRepository.findById.mockRejectedValueOnce(error);

      // Act & Assert
      await expect(getCategoryByIdUseCase.execute(request)).rejects.toThrow('Database error');

      expect(mockCategoryRepository.findById).toHaveBeenCalledWith(1);
      expect(GetCategoryByIdDtoMapper.toDto).not.toHaveBeenCalled();
    });
  });
});
