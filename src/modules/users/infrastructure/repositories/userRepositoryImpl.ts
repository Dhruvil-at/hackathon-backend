import { User } from '../../domain/entities/user';
import { UserRepository, UserFilters } from '../../repositories/userRepository';
import { UserMapper } from '../../mappers/userMapper';
import { BaseRepository } from '../../../../infrastructure/database/base.repository';

export class UserRepositoryImpl extends BaseRepository implements UserRepository {
  async findAll(filters?: UserFilters): Promise<{ users: User[]; total: number }> {
    const { role, teamId, page = 1, limit = 10, sortOrder = 'asc' } = filters || {};

    // Build WHERE clause based on filters
    let whereClause = 'WHERE deleted_at IS NULL';
    const queryParams: any[] = [];

    if (role) {
      whereClause += ' AND role = ?';
      queryParams.push(role);
    }

    if (teamId) {
      whereClause += ' AND teamId = ?';
      queryParams.push(teamId);
    }

    // Get total count for pagination
    const countQuery = `SELECT COUNT(*) as total FROM hackathon.user ${whereClause}`;
    const countResult = await this.executeQuery<any[]>('countUsers', countQuery, queryParams);
    const total = countResult[0].total;

    // Calculate pagination
    const offset = this.calculateOffset(page, limit);

    // Get paginated users
    const usersQuery = `SELECT * FROM hackathon.user ${whereClause} 
         ORDER BY id ${sortOrder === 'desc' ? 'DESC' : 'ASC'} 
         LIMIT ? OFFSET ?`;

    const usersParams = [...queryParams, limit, offset];
    const users = await this.executeQuery<any[]>('findAllUsers', usersQuery, usersParams);

    // Map results to domain entities
    const mappedUsers = users.map((user: any) => UserMapper.toDomain(user));

    return {
      users: mappedUsers,
      total,
    };
  }

  async findById(id: number): Promise<User | null> {
    // Query the database for a specific user by ID
    const result = await this.executeQuery<any[]>(
      'findUserById',
      'SELECT * FROM hackathon.user WHERE id = ? AND deleted_at IS NULL',
      [id],
    );

    // If no user found, return null
    if (!result || result.length === 0) {
      return null;
    }

    // Map the raw database result to a domain entity
    return UserMapper.toDomain(result[0]);
  }

  async updateRole(id: number, role: string, teamId: number): Promise<User | null> {
    // Update the user's role in the database
    let query = `UPDATE hackathon.user SET `;
    if (role) {
      query += `role = "${role}", `;
    }
    if (teamId) {
      query += `teamId = ${teamId}, `;
    }
    query += `updated_at = NOW() WHERE id = ?`;

    await this.executeQuery('updateUserRole', query, [id]);

    // Fetch the updated user to return
    return this.findById(id);
  }
}
