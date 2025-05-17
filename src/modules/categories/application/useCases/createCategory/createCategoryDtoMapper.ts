import { Category } from '../../../domain/entities/category';
import { CreateCategoryResponseDto } from './createCategoryResponseDto';

export class CreateCategoryDtoMapper {
  static toDto(category: Category): CreateCategoryResponseDto {
    return {
      id: category.id as number,
      name: category.name,
      createdAt: category.createdAt,
      updatedAt: category.updatedAt,
    };
  }
}
