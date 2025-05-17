import { Category } from '../domain/entities/category';

export interface CategoryRepository {
  findById(id: number): Promise<Category | null>;
  findAll(): Promise<Category[]>;
  create(category: Category): Promise<Category>;
  update(category: Category): Promise<Category>;
  delete(id: number): Promise<boolean>;
}
