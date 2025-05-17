import { Team } from '../domain/entities/team';

export interface TeamRepository {
  findById(id: number): Promise<Team | null>;
  findAll(): Promise<Team[]>;
  create(team: Team): Promise<Team>;
  update(team: Team): Promise<Team>;
  delete(id: number): Promise<boolean>;
}
