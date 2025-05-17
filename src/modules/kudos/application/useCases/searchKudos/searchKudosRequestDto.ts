export interface SearchKudosRequestDto {
  query: string;
  page?: number;
  limit?: number;
  teamId?: number;
  categoryId?: number;
}
