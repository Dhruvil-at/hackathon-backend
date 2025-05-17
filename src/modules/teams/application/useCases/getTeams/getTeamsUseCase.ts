import { TeamRepository } from '../../../repositories/team.repository';
import { GetTeamsDtoMapper as GetTeamsResponseMapper } from './getTeamsDtoMapper';
import { GetTeamsResponseDto } from './getTeamsResponseDto';

export class GetTeamsUseCase {
  constructor(private teamRepository: TeamRepository) {}

  async execute(): Promise<GetTeamsResponseDto> {
    // Get all teams
    const teams = await this.teamRepository.findAll();

    // Map to response DTO using the mapper
    return GetTeamsResponseMapper.toDto(teams);
  }
}
