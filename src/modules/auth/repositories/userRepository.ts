import { User } from '../domain/entities/user';

export interface UserRepository {
  findByEmail(email: string): Promise<User | null>;
  findById(id: number): Promise<User | null>;
  save(user: User): Promise<void>;
  update(user: User): Promise<void>;
  delete(id: number): Promise<void>;
  searchByName(searchText: string): Promise<User[]>;
}
