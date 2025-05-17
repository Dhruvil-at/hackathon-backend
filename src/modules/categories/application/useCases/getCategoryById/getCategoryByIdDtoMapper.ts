import { Category } from '../../../domain/entities/category';
import { GetCategoryByIdResponseDto } from './getCategoryByIdResponseDto';

export class GetCategoryByIdDtoMapper {
  static toDto(category: Category): GetCategoryByIdResponseDto {
    return {
      id: category.id as number,
      name: category.name,
      createdAt: category.createdAt,
      updatedAt: category.updatedAt,
    };
  }
}
