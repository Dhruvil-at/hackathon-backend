export interface CategoryDto {
  id: number;
  name: string;
}

export interface GetCategoriesResponseDto {
  categories: CategoryDto[];
}
