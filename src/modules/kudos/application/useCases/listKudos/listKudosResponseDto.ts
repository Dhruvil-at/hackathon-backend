export interface KudosItemDto {
  id: string;
  recipientId: string;
  teamId: number;
  teamName?: string;
  categoryId: number;
  categoryName?: string;
  message: string;
  createdBy: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface ListKudosResponseDto {
  kudos: KudosItemDto[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}
