import { Team } from '../../../domain/entities/team';
import { CreateTeamResponseDto } from './createTeamResponseDto';

export class CreateTeamDtoMapper {
  static toDto(team: Team): CreateTeamResponseDto {
    return {
      id: team.id as number,
      name: team.name,
      createdAt: team.createdAt,
      updatedAt: team.updatedAt,
    };
  }
}
