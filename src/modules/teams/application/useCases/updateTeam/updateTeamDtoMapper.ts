import { Team } from '../../../domain/entities/team';
import { UpdateTeamResponseDto } from './updateTeamResponseDto';

export class UpdateTeamDtoMapper {
  static toDto(team: Team): UpdateTeamResponseDto {
    return {
      id: team.id as number,
      name: team.name,
      updatedAt: team.updatedAt,
    };
  }
}
