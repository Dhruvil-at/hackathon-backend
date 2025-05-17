import { TeamRepositoryImpl } from '../../../infrastructure/repositories/team.repository.impl';
import { UpdateTeamUseCase } from './updateTeamUseCase';

export class UpdateTeamFactory {
  static create() {
    const teamRepository = new TeamRepositoryImpl();
    const updateTeamUseCase = new UpdateTeamUseCase(teamRepository);
    return updateTeamUseCase;
  }
}
