import { CreateCategoryUseCase } from './createCategoryUseCase';
import { CategoryRepository } from '../../../repositories/category.repository';
import { Category } from '../../../domain/entities/category';

describe('CreateCategoryUseCase', () => {
  // Setup mocks
  let mockCategoryRepository: jest.Mocked<CategoryRepository>;
  let createCategoryUseCase: CreateCategoryUseCase;

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
    createCategoryUseCase = new CreateCategoryUseCase(mockCategoryRepository);

    // Spy on Category.create without mocking its implementation
    jest.spyOn(Category, 'create');
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  describe('execute', () => {
    it('should create a category successfully with valid name', async () => {
      // Arrange
      const request = { name: 'Test Category' };
      mockCategoryRepository.create.mockResolvedValue(undefined);

      // Act
      await createCategoryUseCase.execute(request);

      // Assert
      expect(Category.create).toHaveBeenCalledWith({ name: 'Test Category' });
      expect(mockCategoryRepository.create).toHaveBeenCalled();
    });

    it('should trim the category name before creating', async () => {
      // Arrange
      const request = { name: '  Category with Spaces  ' };
      mockCategoryRepository.create.mockResolvedValue(undefined);

      // Act
      await createCategoryUseCase.execute(request);

      // Assert
      expect(Category.create).toHaveBeenCalledWith({ name: 'Category with Spaces' });
      expect(mockCategoryRepository.create).toHaveBeenCalled();
    });

    it('should throw an error if name is empty', async () => {
      // Arrange
      const request = { name: '' };

      // Act & Assert
      await expect(createCategoryUseCase.execute(request)).rejects.toThrow(
        'Category name is required',
      );

      expect(Category.create).not.toHaveBeenCalled();
      expect(mockCategoryRepository.create).not.toHaveBeenCalled();
    });

    it('should throw an error if name contains only whitespace', async () => {
      // Arrange
      const request = { name: '   ' };

      // Act & Assert
      await expect(createCategoryUseCase.execute(request)).rejects.toThrow(
        'Category name is required',
      );

      expect(Category.create).not.toHaveBeenCalled();
      expect(mockCategoryRepository.create).not.toHaveBeenCalled();
    });

    it('should propagate errors from repository', async () => {
      // Arrange
      const request = { name: 'Test Category' };
      const error = new Error('Database error');
      mockCategoryRepository.create.mockRejectedValueOnce(error);

      // Act & Assert
      await expect(createCategoryUseCase.execute(request)).rejects.toThrow('Database error');

      expect(Category.create).toHaveBeenCalled();
      expect(mockCategoryRepository.create).toHaveBeenCalled();
    });
  });
});
