import { CategoryRepository } from '../../../repositories/category.repository';
import { GetCategoriesDtoMapper } from './getCategoriesDtoMapper';
import { GetCategoriesResponseDto } from './getCategoriesResponseDto';

export class GetCategoriesUseCase {
  constructor(private categoryRepository: CategoryRepository) {}

  async execute(): Promise<GetCategoriesResponseDto> {
    const categories = await this.categoryRepository.findAll();
    return GetCategoriesDtoMapper.toDto(categories);
  }
}
