import { TeamRepositoryImpl } from '../../../infrastructure/repositories/team.repository.impl';
import { DeleteTeamUseCase } from './deleteTeamUseCase';

export class DeleteTeamFactory {
  static create() {
    const teamRepository = new TeamRepositoryImpl();
    const deleteTeamUseCase = new DeleteTeamUseCase(teamRepository);
    return deleteTeamUseCase;
  }
}
