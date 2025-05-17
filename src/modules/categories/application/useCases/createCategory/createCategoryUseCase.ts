import { Category } from '../../../domain/entities/category';
import { CategoryRepository } from '../../../repositories/category.repository';
import { CreateCategoryDtoMapper } from './createCategoryDtoMapper';
import { CreateCategoryRequestDto } from './createCategoryRequestDto';
import { CreateCategoryResponseDto } from './createCategoryResponseDto';

export class CreateCategoryUseCase {
  constructor(private categoryRepository: CategoryRepository) {}

  async execute(request: CreateCategoryRequestDto): Promise<CreateCategoryResponseDto> {
    // Validate category name
    if (!request.name || request.name.trim() === '') {
      throw new Error('Category name is required');
    }

    // Create category
    const category = Category.create({ name: request.name.trim() });
    const createdCategory = await this.categoryRepository.create(category);

    // Map to response DTO using the mapper
    return CreateCategoryDtoMapper.toDto(createdCategory);
  }
}
