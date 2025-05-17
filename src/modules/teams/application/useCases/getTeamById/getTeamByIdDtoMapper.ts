import { Team } from '../../../domain/entities/team';
import { GetTeamByIdResponseDto } from './getTeamByIdResponseDto';

export class GetTeamByIdDtoMapper {
  static toDto(team: Team): GetTeamByIdResponseDto {
    return {
      id: team.id as number,
      name: team.name,
      createdAt: team.createdAt,
      updatedAt: team.updatedAt,
    };
  }
}
