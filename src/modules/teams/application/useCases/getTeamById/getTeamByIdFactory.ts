import { TeamRepositoryImpl } from '../../../infrastructure/repositories/team.repository.impl';
import { GetTeamByIdUseCase } from './getTeamByIdUseCase';

export class GetTeamByIdFactory {
  static create() {
    const teamRepository = new TeamRepositoryImpl();
    const getTeamByIdUseCase = new GetTeamByIdUseCase(teamRepository);
    return getTeamByIdUseCase;
  }
}
