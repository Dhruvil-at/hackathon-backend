import { CategoryRepository } from '../../../repositories/category.repository';
import { GetCategoryByIdRequestDto } from './getCategoryByIdRequestDto';
import { GetCategoryByIdResponseDto } from './getCategoryByIdResponseDto';
import { GetCategoryByIdDtoMapper } from './getCategoryByIdDtoMapper';

export class GetCategoryByIdUseCase {
  constructor(private categoryRepository: CategoryRepository) {}

  async execute(request: GetCategoryByIdRequestDto): Promise<GetCategoryByIdResponseDto | null> {
    const category = await this.categoryRepository.findById(request.id);

    if (!category) {
      return null;
    }

    return GetCategoryByIdDtoMapper.toDto(category);
  }
}
