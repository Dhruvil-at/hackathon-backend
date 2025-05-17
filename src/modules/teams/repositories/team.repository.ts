import { Team } from '../domain/entities/team';

export interface TeamRepository {
  findById(id: number): Promise<Team | null>;
  findAll(): Promise<Team[]>;
  create(team: Team): Promise<void>;
  update(team: Team): Promise<void>;
  delete(id: number): Promise<boolean>;
}
