import { UpdateCategoryUseCase } from './updateCategoryUseCase';
import { CategoryRepository } from '../../../repositories/category.repository';
import { Category } from '../../../domain/entities/category';

describe('UpdateCategoryUseCase', () => {
  // Setup mocks
  let mockCategoryRepository: jest.Mocked<CategoryRepository>;
  let updateCategoryUseCase: UpdateCategoryUseCase;
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
    updateCategoryUseCase = new UpdateCategoryUseCase(mockCategoryRepository);

    // Create a mock category with update method
    mockCategory = {
      id: 1,
      name: 'Original Category Name',
      createdAt: new Date(),
      updatedAt: new Date(),
      update: jest.fn(),
    } as unknown as Category;
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  describe('execute', () => {
    it('should update a category successfully when it exists', async () => {
      // Arrange
      const request = { id: 1, name: 'Updated Category Name' };
      mockCategoryRepository.findById.mockResolvedValue(mockCategory);
      mockCategoryRepository.update.mockResolvedValue();

      // Act
      await updateCategoryUseCase.execute(request);

      // Assert
      expect(mockCategoryRepository.findById).toHaveBeenCalledWith(1);
      expect(mockCategory.update).toHaveBeenCalledWith('Updated Category Name');
      expect(mockCategoryRepository.update).toHaveBeenCalledWith(mockCategory);
    });

    it('should trim whitespace from category name', async () => {
      // Arrange
      const request = { id: 1, name: '  Category With Spaces  ' };
      mockCategoryRepository.findById.mockResolvedValue(mockCategory);
      mockCategoryRepository.update.mockResolvedValue();

      // Act
      await updateCategoryUseCase.execute(request);

      // Assert
      expect(mockCategoryRepository.findById).toHaveBeenCalledWith(1);
      expect(mockCategory.update).toHaveBeenCalledWith('Category With Spaces');
      expect(mockCategoryRepository.update).toHaveBeenCalledWith(mockCategory);
    });

    it('should throw an error if name is empty', async () => {
      // Arrange
      const request = { id: 1, name: '' };

      // Act & Assert
      await expect(updateCategoryUseCase.execute(request)).rejects.toThrow(
        'Category name is required',
      );

      expect(mockCategoryRepository.findById).not.toHaveBeenCalled();
      expect(mockCategory.update).not.toHaveBeenCalled();
      expect(mockCategoryRepository.update).not.toHaveBeenCalled();
    });

    it('should throw an error if name contains only whitespace', async () => {
      // Arrange
      const request = { id: 1, name: '   ' };

      // Act & Assert
      await expect(updateCategoryUseCase.execute(request)).rejects.toThrow(
        'Category name is required',
      );

      expect(mockCategoryRepository.findById).not.toHaveBeenCalled();
      expect(mockCategory.update).not.toHaveBeenCalled();
      expect(mockCategoryRepository.update).not.toHaveBeenCalled();
    });

    it('should throw an error if category does not exist', async () => {
      // Arrange
      const request = { id: 999, name: 'Valid Name' };
      mockCategoryRepository.findById.mockResolvedValue(null);

      // Act & Assert
      await expect(updateCategoryUseCase.execute(request)).rejects.toThrow('Category not found');

      expect(mockCategoryRepository.findById).toHaveBeenCalledWith(999);
      expect(mockCategory.update).not.toHaveBeenCalled();
      expect(mockCategoryRepository.update).not.toHaveBeenCalled();
    });

    it('should propagate errors from findById repository method', async () => {
      // Arrange
      const request = { id: 1, name: 'Valid Name' };
      const error = new Error('Database error during find');
      mockCategoryRepository.findById.mockRejectedValueOnce(error);

      // Act & Assert
      await expect(updateCategoryUseCase.execute(request)).rejects.toThrow(
        'Database error during find',
      );

      expect(mockCategoryRepository.findById).toHaveBeenCalledWith(1);
      expect(mockCategory.update).not.toHaveBeenCalled();
      expect(mockCategoryRepository.update).not.toHaveBeenCalled();
    });

    it('should propagate errors from update repository method', async () => {
      // Arrange
      const request = { id: 1, name: 'Valid Name' };
      mockCategoryRepository.findById.mockResolvedValue(mockCategory);
      const error = new Error('Database error during update');
      mockCategoryRepository.update.mockRejectedValueOnce(error);

      // Act & Assert
      await expect(updateCategoryUseCase.execute(request)).rejects.toThrow(
        'Database error during update',
      );

      expect(mockCategoryRepository.findById).toHaveBeenCalledWith(1);
      expect(mockCategory.update).toHaveBeenCalledWith('Valid Name');
      expect(mockCategoryRepository.update).toHaveBeenCalledWith(mockCategory);
    });
  });
});
