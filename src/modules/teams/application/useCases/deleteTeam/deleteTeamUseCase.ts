import { TeamRepository } from '../../../repositories/team.repository';
import { DeleteTeamDtoMapper } from './deleteTeamDtoMapper';
import { DeleteTeamRequestDto } from './deleteTeamRequestDto';
import { DeleteTeamResponseDto } from './deleteTeamResponseDto';

export class DeleteTeamUseCase {
  constructor(private teamRepository: TeamRepository) {}

  async execute(request: DeleteTeamRequestDto): Promise<DeleteTeamResponseDto> {
    // Check if team exists
    const existingTeam = await this.teamRepository.findById(request.id);
    if (!existingTeam) {
      throw new Error('Team not found');
    }

    // Delete team
    const isDeleted = await this.teamRepository.delete(request.id);

    // Map to response DTO
    return DeleteTeamDtoMapper.toDto(isDeleted);
  }
}
