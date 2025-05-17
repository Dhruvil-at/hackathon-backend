import { CategoryRepositoryImpl } from '../../../infrastructure/repositories/category.repository.impl';
import { GetCategoriesUseCase } from './getCategoriesUseCase';

export class GetCategoriesFactory {
  static create() {
    const categoryRepository = new CategoryRepositoryImpl();
    const getCategoriesUseCase = new GetCategoriesUseCase(categoryRepository);
    return getCategoriesUseCase;
  }
}
