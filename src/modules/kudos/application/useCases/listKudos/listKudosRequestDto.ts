export interface ListKudosRequestDto {
  recipientId?: string;
  teamId?: number;
  categoryId?: number;
  page?: number;
  limit?: number;
  sortOrder?: 'asc' | 'desc';
}
