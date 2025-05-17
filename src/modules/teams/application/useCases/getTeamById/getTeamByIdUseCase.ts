import { TeamRepository } from '../../../repositories/team.repository';
import { GetTeamByIdDtoMapper } from './getTeamByIdDtoMapper';
import { GetTeamByIdRequestDto } from './getTeamByIdRequestDto';
import { GetTeamByIdResponseDto } from './getTeamByIdResponseDto';

export class GetTeamByIdUseCase {
  constructor(private teamRepository: TeamRepository) {}

  async execute(request: GetTeamByIdRequestDto): Promise<GetTeamByIdResponseDto | null> {
    // Get team by ID
    const team = await this.teamRepository.findById(request.id);

    // If team not found, return null
    if (!team) {
      return null;
    }

    // Map to response DTO using the mapper
    return GetTeamByIdDtoMapper.toDto(team);
  }
}
