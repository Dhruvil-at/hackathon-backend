import { CategoryRepositoryImpl } from '../../../infrastructure/repositories/category.repository.impl';
import { GetCategoryByIdUseCase } from './getCategoryByIdUseCase';

export class GetCategoryByIdFactory {
  static create() {
    const categoryRepository = new CategoryRepositoryImpl();
    const getCategoryByIdUseCase = new GetCategoryByIdUseCase(categoryRepository);
    return getCategoryByIdUseCase;
  }
}
