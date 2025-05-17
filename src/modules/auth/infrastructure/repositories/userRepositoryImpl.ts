import { BaseRepository } from '../../../../infrastructure/database/base.repository';
import { User } from '../../domain/entities/user';
import { UserRepository } from '../../repositories/userRepository';
import { UserMapper } from '../../mappers/userMapper';

export class UserRepositoryImpl extends BaseRepository implements UserRepository {
  async findByEmail(email: string): Promise<User | null> {
    const query = 'SELECT * FROM hackathon.user WHERE email = ? AND deleted_at IS NULL LIMIT 1';

    const result = await this.executeQuery<any[]>('findUserByEmail', query, [email]);

    if (result && result.length > 0) {
      return UserMapper.toDomain(result[0]);
    }

    return null;
  }

  async findById(id: number): Promise<User | null> {
    const query = 'SELECT * FROM hackathon.user WHERE id = ? AND deleted_at IS NULL LIMIT 1';

    const result = await this.executeQuery<any[]>('findUserById', query, [id]);

    if (result && result.length > 0) {
      return UserMapper.toDomain(result[0]);
    }

    return null;
  }

  async save(user: User): Promise<void> {
    const userData = UserMapper.toPersistence(user);

    const query = `
      INSERT INTO hackathon.user 
      (firstName, lastName, email, password, role, teamId, created_at, updated_at) 
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `;

    await this.executeQuery('saveUser', query, [
      userData.firstName,
      userData.lastName,
      userData.email,
      userData.password,
      userData.role,
      userData.teamId,
      userData.created_at,
      userData.updated_at,
    ]);
  }

  async update(user: User): Promise<void> {
    const userData = UserMapper.toPersistence(user);

    const query = `
      UPDATE user 
      SET firstName = ?, 
          lastName = ?, 
          email = ?, 
          password = ?, 
          role = ?, 
          teamId = ?, 
          updated_at = ? 
      WHERE id = ?
    `;

    await this.executeQuery('updateUser', query, [
      userData.firstName,
      userData.lastName,
      userData.email,
      userData.password,
      userData.role,
      userData.teamId,
      userData.updated_at,
      userData.id,
    ]);
  }

  async delete(id: number): Promise<void> {
    const now = new Date();
    const query = 'UPDATE user SET deleted_at = ?, updated_at = ? WHERE id = ?';

    await this.executeQuery('deleteUser', query, [now, now, id]);
  }
}
