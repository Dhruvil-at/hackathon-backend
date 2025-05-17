import { TeamRepository } from '../../../repositories/team.repository';
import { UpdateTeamDtoMapper } from './updateTeamDtoMapper';
import { UpdateTeamRequestDto } from './updateTeamRequestDto';
import { UpdateTeamResponseDto } from './updateTeamResponseDto';

export class UpdateTeamUseCase {
  constructor(private teamRepository: TeamRepository) {}

  async execute(request: UpdateTeamRequestDto): Promise<UpdateTeamResponseDto> {
    // Validate team name
    if (!request.name || request.name.trim() === '') {
      throw new Error('Team name is required');
    }

    // Find team
    const existingTeam = await this.teamRepository.findById(request.id);
    if (!existingTeam) {
      throw new Error('Team not found');
    }

    // Update team
    existingTeam.update(request.name.trim());
    const updatedTeam = await this.teamRepository.update(existingTeam);

    // Map to response DTO using the mapper
    return UpdateTeamDtoMapper.toDto(updatedTeam);
  }
}
