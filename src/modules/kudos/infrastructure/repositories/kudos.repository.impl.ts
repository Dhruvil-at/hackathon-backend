import { Kudos } from '../../domain/entities/kudos.entity';
import { KudosFilters, KudosRepository } from '../../repositories/kudos.repository';
import { KudosMapper } from '../../mappers/kudos.mapper';
import { BaseRepository } from '../../../../infrastructure/database/base.repository';

export class KudosRepositoryImpl extends BaseRepository implements KudosRepository {
  async create(kudos: Kudos): Promise<Kudos> {
    const kudosData = KudosMapper.toPersistence(kudos);
    const query = `
      INSERT INTO hackathon.kudos 
      ( recipientId, categoryId, message, createdById, createdAt, updatedAt) 
      VALUES (?, ?, ?, ?, ?, ?)
    `;
    const params = [
      kudosData.recipientId,
      kudosData.categoryId,
      kudosData.message,
      kudosData.created_by,
      kudosData.created_at,
      kudosData.updated_at,
    ];

    await this.executeQuery('createKudos', query, params);
    return kudos;
  }

  async findById(id: string): Promise<Kudos | null> {
    const query = `SELECT k.*, t.name as teamName, c.name as categoryName FROM hackathon.kudos k 
      LEFT JOIN hackathon.user u ON k.recipientId = u.id 
      LEFT JOIN hackathon.teams t ON u.teamId = t.id 
      LEFT JOIN hackathon.categories c ON k.categoryId = c.id 
      WHERE k.id = ? AND k.deletedAt IS NULL`;

    const rows = await this.executeQuery<any[]>('findKudosById', query, [id]);

    if (rows.length === 0) {
      return null;
    }

    return KudosMapper.toDomain(rows[0]);
  }

  async findAll(filters?: KudosFilters): Promise<{ kudos: Kudos[]; total: number }> {
    let query =
      'SELECT k.*, t.name as teamName, c.name as categoryName FROM hackathon.kudos k ' +
      'LEFT JOIN hackathon.user u ON k.recipientId = u.id ' +
      'LEFT JOIN hackathon.teams t ON u.teamId = t.id ' +
      'LEFT JOIN hackathon.categories c ON k.categoryId = c.id ' +
      'WHERE k.deletedAt IS NULL';

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

    // Get total count
    const countQuery = query.replace(
      'k.*, t.name as teamName, c.name as categoryName',
      'COUNT(*) as total',
    );
    const countRows = await this.executeQuery<any[]>('countKudos', countQuery, params);
    const total = countRows[0].total;

    // Add pagination
    const page = filters?.page || 1;
    const limit = filters?.limit || 10;
    const offset = this.calculateOffset(page, limit);

    query += ' ORDER BY k.createdat DESC LIMIT ? OFFSET ?';
    params.push(limit, offset);

    const rows = await this.executeQuery<any[]>('findAllKudos', query, params);

    return {
      kudos: rows.map((row) => KudosMapper.toDomain(row)),
      total,
    };
  }

  async search(query: string, filters?: KudosFilters): Promise<{ kudos: Kudos[]; total: number }> {
    let sqlQuery =
      'SELECT k.*, t.name as teamName, c.name as categoryName, k.recipientId as recipientId FROM hackathon.kudos k ' +
      'LEFT JOIN hackathon.user u ON k.recipientId = u.id ' +
      'LEFT JOIN hackathon.teams t ON u.teamId = t.id ' +
      'LEFT JOIN hackathon.categories c ON k.categoryId = c.id ' +
      'WHERE k.deletedAt IS NULL AND ' +
      '(u.firstName LIKE ? OR u.lastName LIKE ? OR k.message LIKE ?)';

    const params: any[] = [`${query}%`, `${query}%`, `${query}%`];

    if (filters?.teamId) {
      sqlQuery += ' AND u.teamId = ?';
      params.push(filters.teamId);
    }

    if (filters?.categoryId) {
      sqlQuery += ' AND k.categoryId = ?';
      params.push(filters.categoryId);
    }

    // Get total count
    const countQuery = sqlQuery.replace(
      'k.*, t.name as teamName, c.name as categoryName, k.recipientId as recipientId',
      'COUNT(*) as total',
    );
    const countRows = await this.executeQuery<any[]>('countSearchKudos', countQuery, params);
    const total = countRows[0].total;

    // Add pagination
    const page = filters?.page || 1;
    const limit = filters?.limit || 10;
    const offset = this.calculateOffset(page, limit);

    sqlQuery += ' ORDER BY k.createdat DESC LIMIT ? OFFSET ?';
    params.push(limit, offset);

    const rows = await this.executeQuery<any[]>('searchKudos', sqlQuery, params);

    return {
      kudos: rows.map((row) => KudosMapper.toDomain(row)),
      total,
    };
  }
}
