export interface GetKudosByIdResponseDto {
  id: string;
  recipientId: string;
  recipientName: string;
  teamId: number;
  teamName: string;
  categoryId: number;
  categoryName: string;
  message: string;
  createdBy: number;
  createdByName: string;
  createdAt: Date;
  updatedAt: Date;
}
