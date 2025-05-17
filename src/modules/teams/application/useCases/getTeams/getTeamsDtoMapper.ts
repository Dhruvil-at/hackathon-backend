import { Team } from '../../../domain/entities/team';
import { TeamDto, GetTeamsResponseDto } from './getTeamsResponseDto';

export class GetTeamsDtoMapper {
  static toTeamDto(team: Team): TeamDto {
    return {
      id: team.id as number,
      name: team.name,
    };
  }

  static toDto(teams: Team[]): GetTeamsResponseDto {
    return {
      teams: teams.map((team) => this.toTeamDto(team)),
    };
  }
}
