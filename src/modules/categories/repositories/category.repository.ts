import { Category } from '../domain/entities/category';

export interface CategoryRepository {
  findById(id: number): Promise<Category | null>;
  findAll(): Promise<Category[]>;
  create(category: Category): Promise<void>;
  update(category: Category): Promise<void>;
  delete(id: number): Promise<boolean>;
}
