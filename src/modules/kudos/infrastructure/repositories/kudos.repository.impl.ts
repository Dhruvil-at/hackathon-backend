import { Kudos } from '../../domain/entities/kudos.entity';
import { KudosFilters, KudosRepository } from '../../repositories/kudos.repository';
import { KudosMapper } from '../../mappers/kudos.mapper';
import { BaseRepository } from '../../../../infrastructure/database/base.repository';

export class KudosRepositoryImpl extends BaseRepository implements KudosRepository {
  async create(kudos: Kudos): Promise<void> {
    const kudosData = KudosMapper.toPersistence(kudos);
    const query = `
      INSERT INTO hackathon.kudos 
      ( recipientId, categoryId, teamId, message, createdById, createdAt, updatedAt) 
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `;
    const params = [
      kudosData.recipientId,
      kudosData.categoryId,
      kudosData.teamId,
      kudosData.message,
      kudosData.createdBy,
      kudosData.createdAt,
      kudosData.updatedAt,
    ];

    await this.executeQuery('createKudos', query, params);
  }

  async findById(id: string): Promise<Kudos | null> {
    const query = `SELECT k.id,k.recipientId,k.message,k.categoryId,k.createdAt,k.updatedAt,k.teamId, t.name as teamName, c.name as categoryName, 
                   CONCAT(u.firstName, ' ', u.lastName) as recipientName,
                   CONCAT(creator.firstName, ' ', creator.lastName) as createdByName 
                   FROM hackathon.kudos k 
                   LEFT JOIN hackathon.user u ON k.recipientId = u.id 
                   LEFT JOIN hackathon.teams t ON k.teamId = t.id 
                   LEFT JOIN hackathon.categories c ON k.categoryId = c.id 
                   LEFT JOIN hackathon.user creator ON k.createdById = creator.id
                   WHERE k.id = ? AND k.deletedAt IS NULL AND u.deleted_at IS NULL AND creator.deleted_at IS NULL`;

    const rows = await this.executeQuery<any[]>('findKudosById', query, [id]);

    if (rows.length === 0) {
      return null;
    }

    return KudosMapper.toDomain(rows[0]);
  }

  async findAll(filters?: KudosFilters): Promise<{ kudos: Kudos[]; total: number }> {
    // Get total count with a separate query
    const countQuery = `
      SELECT COUNT(*) as total 
      FROM hackathon.kudos k
      LEFT JOIN hackathon.user u ON k.recipientId = u.id
      WHERE k.deletedAt IS NULL AND u.deleted_at IS NULL
      ${filters?.recipientId ? 'AND k.recipientId LIKE ?' : ''}
      ${filters?.teamId ? 'AND k.teamId = ?' : ''}
      ${filters?.categoryId ? 'AND k.categoryId = ?' : ''}
    `;

    const countParams: any[] = [];
    if (filters?.recipientId) countParams.push(`%${filters.recipientId}%`);
    if (filters?.teamId) countParams.push(filters.teamId);
    if (filters?.categoryId) countParams.push(filters.categoryId);

    const countRows = await this.executeQuery<any[]>('countKudos', countQuery, countParams);
    const total = countRows[0].total;

    // Data query
    let query = `SELECT k.id,k.recipientId,k.message,k.categoryId,k.createdAt,k.updatedAt,k.teamId, t.name as teamName, c.name as categoryName,
      CONCAT(u.firstName, ' ', u.lastName) as recipientName,
      CONCAT(creator.firstName, ' ', creator.lastName) as createdByName
      FROM hackathon.kudos k
      LEFT JOIN hackathon.user u ON k.recipientId = u.id and u.deleted_at IS NULL
      LEFT JOIN hackathon.teams t ON k.teamId = t.id
      LEFT JOIN hackathon.categories c ON k.categoryId = c.id
      LEFT JOIN hackathon.user creator ON k.createdById = creator.id and creator.deleted_at IS NULL
      WHERE k.deletedAt IS NULL AND u.deleted_at IS NULL AND creator.deleted_at IS NULL`;

    const params: any[] = [];

    if (filters?.recipientId) {
      query += ' AND k.recipientId LIKE ?';
      params.push(`%${filters.recipientId}%`);
    }

    if (filters?.teamId) {
      query += ' AND u.teamId = ?';
      params.push(filters.teamId);
    }

    if (filters?.categoryId) {
      query += ' AND k.categoryId = ?';
      params.push(filters.categoryId);
    }

    // Add pagination
    const page = filters?.page || 1;
    const limit = filters?.limit || 10;
    const offset = this.calculateOffset(page, limit);

    // Set default sort order to DESC if not provided
    const sortOrder = filters?.sortOrder || 'desc';
    query += ` ORDER BY k.createdAt ${sortOrder.toUpperCase()} LIMIT ? OFFSET ?`;
    params.push(limit, offset);

    const rows = await this.executeQuery<any[]>('findAllKudos', query, params);

    return {
      kudos: rows.map((row) => KudosMapper.toDomain(row)),
      total,
    };
  }

  async search(query: string, filters?: KudosFilters): Promise<{ kudos: Kudos[]; total: number }> {
    let sqlQuery = `SELECT k.id,k.recipientId,k.message,k.categoryId,k.createdAt,k.updatedAt, k.teamId, t.name as teamName, c.name as categoryName,
      CONCAT(u.firstName, ' ', u.lastName) as recipientName,
      CONCAT(creator.firstName, ' ', creator.lastName) as createdByName,
      k.recipientId as recipientId FROM hackathon.kudos k
      LEFT JOIN hackathon.user u ON k.recipientId = u.id and u.deleted_at IS NULL
      LEFT JOIN hackathon.teams t ON k.teamId = t.id
      LEFT JOIN hackathon.categories c ON k.categoryId = c.id
      LEFT JOIN hackathon.user creator ON k.createdById = creator.id and creator.deleted_at IS NULL
      WHERE k.deletedAt IS NULL AND u.deleted_at IS NULL AND creator.deleted_at IS NULL AND (u.firstName LIKE ? OR u.lastName LIKE ? OR k.message LIKE ?)`;

    const params: any[] = [`${query}%`, `${query}%`, `${query}%`];

    if (filters?.teamId) {
      sqlQuery += ' AND u.teamId = ?';
      params.push(filters.teamId);
    }

    if (filters?.categoryId) {
      sqlQuery += ' AND k.categoryId = ?';
      params.push(filters.categoryId);
    }

    // Always limit to 10 records
    sqlQuery += ' ORDER BY k.createdAt DESC LIMIT 10';

    const rows = await this.executeQuery<any[]>('searchKudos', sqlQuery, params);

    return {
      kudos: rows.map((row) => KudosMapper.toDomain(row)),
      total: rows.length, // Just return the actual number of results
    };
  }
}
