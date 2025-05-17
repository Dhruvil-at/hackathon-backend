import { DeleteTeamResponseDto } from './deleteTeamResponseDto';

export class DeleteTeamDtoMapper {
  static toDto(success: boolean): DeleteTeamResponseDto {
    return {
      success,
      message: success ? 'Team deleted successfully' : 'Failed to delete team',
    };
  }
}
