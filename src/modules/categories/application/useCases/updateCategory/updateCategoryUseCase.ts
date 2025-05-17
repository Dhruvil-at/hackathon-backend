import { CategoryRepository } from '../../../repositories/category.repository';
import { UpdateCategoryRequestDto } from './updateCategoryRequestDto';

export class UpdateCategoryUseCase {
  constructor(private categoryRepository: CategoryRepository) {}

  async execute(request: UpdateCategoryRequestDto): Promise<void> {
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
    await this.categoryRepository.update(category);
  }
}
