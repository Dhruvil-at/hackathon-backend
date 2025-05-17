import { Team } from '../../../domain/entities/team';
import { TeamRepository } from '../../../repositories/team.repository';
import { CreateTeamRequestDto } from './createTeamRequestDto';

export class CreateTeamUseCase {
  constructor(private teamRepository: TeamRepository) {}

  async execute(request: CreateTeamRequestDto): Promise<void> {
    // Validate team name
    if (!request.name || request.name.trim() === '') {
      throw new Error('Team name is required');
    }

    // Create team
    const team = Team.create({ name: request.name.trim() });
    await this.teamRepository.create(team);
  }
}
