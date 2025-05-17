import { CategoryRepository } from '../../../repositories/category.repository';
import { DeleteCategoryRequestDto } from './deleteCategoryRequestDto';
import { DeleteCategoryResponseDto } from './deleteCategoryResponseDto';
import { DeleteCategoryDtoMapper } from './deleteCategoryDtoMapper';

export class DeleteCategoryUseCase {
  constructor(private categoryRepository: CategoryRepository) {}

  async execute(request: DeleteCategoryRequestDto): Promise<DeleteCategoryResponseDto> {
    try {
      // Check if category exists
      const category = await this.categoryRepository.findById(request.id);
      if (!category) {
        return DeleteCategoryDtoMapper.toDto(false, 'Category not found');
      }

      // Delete the category
      const result = await this.categoryRepository.delete(request.id);

      if (result) {
        return DeleteCategoryDtoMapper.toDto(true, 'Category deleted successfully');
      } else {
        return DeleteCategoryDtoMapper.toDto(false, 'Failed to delete category');
      }
    } catch (error) {
      return DeleteCategoryDtoMapper.toDto(
        false,
        error instanceof Error ? error.message : 'An unknown error occurred',
      );
    }
  }
}
