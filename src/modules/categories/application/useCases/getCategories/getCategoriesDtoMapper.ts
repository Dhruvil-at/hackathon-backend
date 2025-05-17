import { Category } from '../../../domain/entities/category';
import { CategoryDto, GetCategoriesResponseDto } from './getCategoriesResponseDto';

export class GetCategoriesDtoMapper {
  static toCategoryDto(category: Category): CategoryDto {
    return {
      id: category.id as number,
      name: category.name,
    };
  }

  static toDto(categories: Category[]): GetCategoriesResponseDto {
    return {
      categories: categories.map((category) => this.toCategoryDto(category)),
    };
  }
}
