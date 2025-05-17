import { CategoryRepositoryImpl } from '../../../infrastructure/repositories/category.repository.impl';
import { UpdateCategoryUseCase } from './updateCategoryUseCase';

export class UpdateCategoryFactory {
  static create() {
    const categoryRepository = new CategoryRepositoryImpl();
    const updateCategoryUseCase = new UpdateCategoryUseCase(categoryRepository);
    return updateCategoryUseCase;
  }
}
