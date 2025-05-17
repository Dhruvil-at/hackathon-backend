import { CategoryRepositoryImpl } from '../../../infrastructure/repositories/category.repository.impl';
import { DeleteCategoryUseCase } from './deleteCategoryUseCase';

export class DeleteCategoryFactory {
  static create() {
    const categoryRepository = new CategoryRepositoryImpl();
    const deleteCategoryUseCase = new DeleteCategoryUseCase(categoryRepository);
    return deleteCategoryUseCase;
  }
}
