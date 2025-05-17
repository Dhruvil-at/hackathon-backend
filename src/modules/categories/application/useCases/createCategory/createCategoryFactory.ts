import { CategoryRepositoryImpl } from '../../../infrastructure/repositories/category.repository.impl';
import { CreateCategoryUseCase } from './createCategoryUseCase';

export class CreateCategoryFactory {
  static create() {
    const categoryRepository = new CategoryRepositoryImpl();
    const createCategoryUseCase = new CreateCategoryUseCase(categoryRepository);
    return createCategoryUseCase;
  }
}
