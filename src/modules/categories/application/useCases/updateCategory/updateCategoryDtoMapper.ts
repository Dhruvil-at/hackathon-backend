import { Category } from '../../../domain/entities/category';
import { UpdateCategoryResponseDto } from './updateCategoryResponseDto';

export class UpdateCategoryDtoMapper {
  static toDto(category: Category): UpdateCategoryResponseDto {
    return {
      id: category.id as number,
      name: category.name,
      createdAt: category.createdAt,
      updatedAt: category.updatedAt,
    };
  }
}
