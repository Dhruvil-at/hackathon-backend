export interface CreateKudosResponseDto {
  id: string;
  recipientId: string;
  teamId: number;
  teamName?: string;
  categoryId: number;
  categoryName?: string;
  message: string;
  createdBy: number;
  createdAt: Date;
}
