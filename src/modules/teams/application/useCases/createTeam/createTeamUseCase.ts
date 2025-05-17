import { Team } from '../../../domain/entities/team';
import { TeamRepository } from '../../../repositories/team.repository';
import { CreateTeamDtoMapper } from './createTeamDtoMapper';
import { CreateTeamRequestDto } from './createTeamRequestDto';
import { CreateTeamResponseDto } from './createTeamResponseDto';

export class CreateTeamUseCase {
  constructor(private teamRepository: TeamRepository) {}

  async execute(request: CreateTeamRequestDto): Promise<CreateTeamResponseDto> {
    // Validate team name
    if (!request.name || request.name.trim() === '') {
      throw new Error('Team name is required');
    }

    // Create team
    const team = Team.create({ name: request.name.trim() });
    const createdTeam = await this.teamRepository.create(team);

    // Map to response DTO using the mapper
    return CreateTeamDtoMapper.toDto(createdTeam);
  }
}
