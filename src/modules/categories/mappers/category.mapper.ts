import { Category } from '../domain/entities/category';

interface CategoryRow {
  id: number;
  name: string;
  created_at: Date;
  updated_at: Date;
  deleted_at?: Date | null;
}

export class CategoryMapper {
  /**
   * Map from database row to domain entity
   */
  public static toDomain(row: CategoryRow): Category {
    const props = {
      id: row.id,
      name: row.name,
      deletedAt: row.deleted_at || null,
      createdAt: row.created_at,
      updatedAt: row.updated_at,
    };
    return Category.create(props);
  }

  /**
   * Map from domain entity to database row
   */
  public static toPersistence(category: Category): Partial<CategoryRow> {
    return {
      name: category.name,
      // id is handled by the database
      // timestamps are handled by the database
    };
  }
}
