import { Category } from '../../../domain/entities/category';
import { CategoryRepository } from '../../../repositories/category.repository';
import { CreateCategoryRequestDto } from './createCategoryRequestDto';

export class CreateCategoryUseCase {
  constructor(private categoryRepository: CategoryRepository) {}

  async execute(request: CreateCategoryRequestDto): Promise<void> {
    // Validate category name
    if (!request.name || request.name.trim() === '') {
      throw new Error('Category name is required');
    }

    // Create category
    const category = Category.create({ name: request.name.trim() });
    await this.categoryRepository.create(category);
  }
}
