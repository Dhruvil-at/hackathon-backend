export interface TeamDto {
  id: number;
  name: string;
}

export interface GetTeamsResponseDto {
  teams: TeamDto[];
}
