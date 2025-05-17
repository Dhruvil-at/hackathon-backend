import { TeamRepositoryImpl } from '../../../infrastructure/repositories/team.repository.impl';
import { CreateTeamUseCase } from './createTeamUseCase';

export class CreateTeamFactory {
  static create() {
    const teamRepository = new TeamRepositoryImpl();
    const createTeamUseCase = new CreateTeamUseCase(teamRepository);
    return createTeamUseCase;
  }
}
