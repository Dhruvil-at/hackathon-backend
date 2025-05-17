import { TeamRepository } from '../../../repositories/team.repository';
import { UpdateTeamRequestDto } from './updateTeamRequestDto';

export class UpdateTeamUseCase {
  constructor(private teamRepository: TeamRepository) {}

  async execute(request: UpdateTeamRequestDto): Promise<void> {
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
    await this.teamRepository.update(existingTeam);
  }
}
