import { DeleteCategoryUseCase } from './deleteCategoryUseCase';
import { CategoryRepository } from '../../../repositories/category.repository';
import { DeleteCategoryDtoMapper } from './deleteCategoryDtoMapper';
import { Category } from '../../../domain/entities/category';

describe('DeleteCategoryUseCase', () => {
  // Setup mocks
  let mockCategoryRepository: jest.Mocked<CategoryRepository>;
  let deleteCategoryUseCase: DeleteCategoryUseCase;
  let mockCategory: Category;

  beforeEach(() => {
    // Create a fresh mock for each test
    mockCategoryRepository = {
      create: jest.fn(),
      findAll: jest.fn(),
      findById: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    } as jest.Mocked<CategoryRepository>;

    // Create the use case with the mock repository
    deleteCategoryUseCase = new DeleteCategoryUseCase(mockCategoryRepository);

    // Create a mock category
    mockCategory = {
      id: 1,
      name: 'Test Category',
      createdAt: new Date(),
      updatedAt: new Date(),
    } as Category;

    // Spy on DeleteCategoryDtoMapper without mocking its implementation
    jest.spyOn(DeleteCategoryDtoMapper, 'toDto');
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  describe('execute', () => {
    it('should delete a category successfully when it exists', async () => {
      // Arrange
      const request = { id: 1 };
      mockCategoryRepository.findById.mockResolvedValue(mockCategory);
      mockCategoryRepository.delete.mockResolvedValue(true);

      // Act
      const result = await deleteCategoryUseCase.execute(request);

      // Assert
      expect(mockCategoryRepository.findById).toHaveBeenCalledWith(1);
      expect(mockCategoryRepository.delete).toHaveBeenCalledWith(1);
      expect(DeleteCategoryDtoMapper.toDto).toHaveBeenCalledWith(
        true,
        'Category deleted successfully',
      );
      expect(result).toEqual({
        success: true,
        message: 'Category deleted successfully',
      });
    });

    it('should return failure response when deletion fails', async () => {
      // Arrange
      const request = { id: 1 };
      mockCategoryRepository.findById.mockResolvedValue(mockCategory);
      mockCategoryRepository.delete.mockResolvedValue(false);

      // Act
      const result = await deleteCategoryUseCase.execute(request);

      // Assert
      expect(mockCategoryRepository.findById).toHaveBeenCalledWith(1);
      expect(mockCategoryRepository.delete).toHaveBeenCalledWith(1);
      expect(DeleteCategoryDtoMapper.toDto).toHaveBeenCalledWith(
        false,
        'Failed to delete category',
      );
      expect(result).toEqual({
        success: false,
        message: 'Failed to delete category',
      });
    });

    it('should return failure response when category does not exist', async () => {
      // Arrange
      const request = { id: 999 };
      mockCategoryRepository.findById.mockResolvedValue(null);

      // Act
      const result = await deleteCategoryUseCase.execute(request);

      // Assert
      expect(mockCategoryRepository.findById).toHaveBeenCalledWith(999);
      expect(mockCategoryRepository.delete).not.toHaveBeenCalled();
      expect(DeleteCategoryDtoMapper.toDto).toHaveBeenCalledWith(false, 'Category not found');
      expect(result).toEqual({
        success: false,
        message: 'Category not found',
      });
    });

    it('should handle errors from findById repository method', async () => {
      // Arrange
      const request = { id: 1 };
      const error = new Error('Database error during find');
      mockCategoryRepository.findById.mockRejectedValueOnce(error);

      // Act
      const result = await deleteCategoryUseCase.execute(request);

      // Assert
      expect(mockCategoryRepository.findById).toHaveBeenCalledWith(1);
      expect(mockCategoryRepository.delete).not.toHaveBeenCalled();
      expect(DeleteCategoryDtoMapper.toDto).toHaveBeenCalledWith(
        false,
        'Database error during find',
      );
      expect(result).toEqual({
        success: false,
        message: 'Database error during find',
      });
    });

    it('should handle errors from delete repository method', async () => {
      // Arrange
      const request = { id: 1 };
      mockCategoryRepository.findById.mockResolvedValue(mockCategory);
      const error = new Error('Database error during delete');
      mockCategoryRepository.delete.mockRejectedValueOnce(error);

      // Act
      const result = await deleteCategoryUseCase.execute(request);

      // Assert
      expect(mockCategoryRepository.findById).toHaveBeenCalledWith(1);
      expect(mockCategoryRepository.delete).toHaveBeenCalledWith(1);
      expect(DeleteCategoryDtoMapper.toDto).toHaveBeenCalledWith(
        false,
        'Database error during delete',
      );
      expect(result).toEqual({
        success: false,
        message: 'Database error during delete',
      });
    });
  });
});
