import { CategoryRepository } from '../../../repositories/category.repository';
import { UpdateCategoryRequestDto } from './updateCategoryRequestDto';
import { UpdateCategoryResponseDto } from './updateCategoryResponseDto';
import { UpdateCategoryDtoMapper } from './updateCategoryDtoMapper';

export class UpdateCategoryUseCase {
  constructor(private categoryRepository: CategoryRepository) {}

  async execute(request: UpdateCategoryRequestDto): Promise<UpdateCategoryResponseDto> {
    // Validate category name
    if (!request.name || request.name.trim() === '') {
      throw new Error('Category name is required');
    }

    // Find the category
    const category = await this.categoryRepository.findById(request.id);
    if (!category) {
      throw new Error('Category not found');
    }

    // Update the category
    category.update(request.name.trim());
    const updatedCategory = await this.categoryRepository.update(category);

    // Map to DTO using the mapper
    return UpdateCategoryDtoMapper.toDto(updatedCategory);
  }
}
