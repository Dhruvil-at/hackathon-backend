import { TeamRepositoryImpl } from '../../../infrastructure/repositories/team.repository.impl';
import { GetTeamsUseCase } from './getTeamsUseCase';

export class GetTeamsFactory {
  static create() {
    const teamRepository = new TeamRepositoryImpl();
    const getTeamsUseCase = new GetTeamsUseCase(teamRepository);
    return getTeamsUseCase;
  }
}
