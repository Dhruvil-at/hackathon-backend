import { GetCategoriesUseCase } from './getCategoriesUseCase';
import { CategoryRepository } from '../../../repositories/category.repository';
import { GetCategoriesDtoMapper } from './getCategoriesDtoMapper';
import { Category } from '../../../domain/entities/category';

describe('GetCategoriesUseCase', () => {
  // Setup mocks
  let mockCategoryRepository: jest.Mocked<CategoryRepository>;
  let getCategoriesUseCase: GetCategoriesUseCase;
  let mockCategories: Category[];
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
    getCategoriesUseCase = new GetCategoriesUseCase(mockCategoryRepository);

    // Create mock categories for testing with fixed dates
    mockCategories = [
      {
        id: 1,
        name: 'Category A',
        createdAt: mockDate,
        updatedAt: mockDate,
      } as Category,
      {
        id: 2,
        name: 'Category B',
        createdAt: mockDate,
        updatedAt: mockDate,
      } as Category,
    ];

    // Spy on GetCategoriesDtoMapper without mocking its implementation
    jest.spyOn(GetCategoriesDtoMapper, 'toDto');
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  describe('execute', () => {
    it('should return all categories when categories exist', async () => {
      // Arrange
      mockCategoryRepository.findAll.mockResolvedValue(mockCategories);

      // Act
      const result = await getCategoriesUseCase.execute();

      // Assert
      expect(mockCategoryRepository.findAll).toHaveBeenCalled();
      expect(GetCategoriesDtoMapper.toDto).toHaveBeenCalledWith(mockCategories);
      expect(result).toEqual({
        categories: [
          {
            id: 1,
            name: 'Category A',
          },
          {
            id: 2,
            name: 'Category B',
          },
        ],
      });
    });

    it('should return empty array when no categories exist', async () => {
      // Arrange
      mockCategoryRepository.findAll.mockResolvedValue([]);

      // Act
      const result = await getCategoriesUseCase.execute();

      // Assert
      expect(mockCategoryRepository.findAll).toHaveBeenCalled();
      expect(GetCategoriesDtoMapper.toDto).toHaveBeenCalledWith([]);
      expect(result).toEqual({ categories: [] });
    });

    it('should propagate errors from repository', async () => {
      // Arrange
      const error = new Error('Database error');
      mockCategoryRepository.findAll.mockRejectedValueOnce(error);

      // Act & Assert
      await expect(getCategoriesUseCase.execute()).rejects.toThrow('Database error');

      expect(mockCategoryRepository.findAll).toHaveBeenCalled();
      expect(GetCategoriesDtoMapper.toDto).not.toHaveBeenCalled();
    });
  });
});
