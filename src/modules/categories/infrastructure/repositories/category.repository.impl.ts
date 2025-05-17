import { BaseRepository } from '../../../../infrastructure/database';
import { Category } from '../../domain/entities/category';
import { CategoryRepository } from '../../repositories/category.repository';
import { CategoryMapper } from '../../mappers/category.mapper';

interface CategoryRow {
  id: number;
  name: string;
  created_at: Date;
  updated_at: Date;
  deleted_at?: Date | null;
}

export class CategoryRepositoryImpl extends BaseRepository implements CategoryRepository {
  /**
   * Find a category by ID
   */
  async findById(id: number): Promise<Category | null> {
    try {
      const query = `
        SELECT id, name, created_at, updated_at
        FROM hackathon.categories
        WHERE id = ? AND deleted_at IS NULL
      `;

      const categories = await this.executeQuery<CategoryRow[]>('category-find-by-id', query, [id]);

      if (!categories || categories.length === 0) {
        return null;
      }

      return CategoryMapper.toDomain(categories[0]);
    } catch (error) {
      console.error('Error finding category by ID:', error);
      throw new Error('Failed to find category');
    }
  }

  /**
   * Find all categories
   */
  async findAll(): Promise<Category[]> {
    try {
      const query = `
        SELECT id, name, created_at, updated_at
        FROM hackathon.categories
        WHERE deleted_at IS NULL
        ORDER BY name ASC
      `;

      const categories = await this.executeQuery<CategoryRow[]>('category-find-all', query);

      if (!categories || categories.length === 0) {
        return [];
      }

      return categories.map((category) => CategoryMapper.toDomain(category));
    } catch (error) {
      console.error('Error finding all categories:', error);
      throw new Error('Failed to find categories');
    }
  }

  /**
   * Create a new category
   */
  async create(category: Category): Promise<Category> {
    try {
      const categoryData = CategoryMapper.toPersistence(category);

      const query = `
        INSERT INTO hackathon.categories (name)
        VALUES (?)
      `;

      const result = await this.executeQuery<any>('category-create', query, [categoryData.name]);

      return this.findById(result.insertId) as Promise<Category>;
    } catch (error) {
      console.error('Error creating category:', error);
      // Check for duplicate name error
      if (error instanceof Error && error.message.includes('Duplicate entry')) {
        throw new Error('Category with this name already exists');
      }
      throw new Error('Failed to create category');
    }
  }

  /**
   * Update an existing category
   */
  async update(category: Category): Promise<Category> {
    try {
      if (!category.id) {
        throw new Error('Category ID is required for update');
      }

      const categoryData = CategoryMapper.toPersistence(category);

      const query = `
        UPDATE hackathon.categories
        SET name = ?
        WHERE id = ? AND deleted_at IS NULL
      `;

      await this.executeQuery('category-update', query, [categoryData.name, category.id]);

      return this.findById(category.id) as Promise<Category>;
    } catch (error) {
      console.error('Error updating category:', error);
      // Check for duplicate name error
      if (error instanceof Error && error.message.includes('Duplicate entry')) {
        throw new Error('Category with this name already exists');
      }
      throw new Error('Failed to update category');
    }
  }

  /**
   * Soft delete a category
   */
  async delete(id: number): Promise<boolean> {
    try {
      const query = `
        UPDATE hackathon.categories
        SET deleted_at = NOW()
        WHERE id = ? AND deleted_at IS NULL
      `;

      const result = await this.executeQuery<any>('category-delete', query, [id]);
      return result.affectedRows > 0;
    } catch (error) {
      console.error('Error deleting category:', error);
      throw new Error('Failed to delete category');
    }
  }
}
