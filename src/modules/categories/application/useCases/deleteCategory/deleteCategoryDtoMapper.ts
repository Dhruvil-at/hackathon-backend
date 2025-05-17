import { DeleteCategoryResponseDto } from './deleteCategoryResponseDto';

export class DeleteCategoryDtoMapper {
  static toDto(success: boolean, message: string): DeleteCategoryResponseDto {
    return {
      success,
      message,
    };
  }
}
