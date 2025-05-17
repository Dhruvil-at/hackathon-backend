import { Kudos } from '../domain/entities/kudos.entity';

export interface KudosFilters {
  recipientId?: string;
  teamId?: number;
  categoryId?: number;
  page?: number;
  limit?: number;
  sortOrder?: 'asc' | 'desc';
}

export interface KudosRepository {
  create(kudos: Kudos): Promise<void>;
  findById(id: string): Promise<Kudos | null>;
  findAll(filters?: KudosFilters): Promise<{ kudos: Kudos[]; total: number }>;
  search(query: string, filters?: KudosFilters): Promise<{ kudos: Kudos[]; total: number }>;
}
