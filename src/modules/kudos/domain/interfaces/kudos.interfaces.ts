export enum KudosCategory {
  TEAMWORK = 'TEAMWORK',
  INNOVATION = 'INNOVATION',
  HELPING_HAND = 'HELPING_HAND',
  EXCELLENCE = 'EXCELLENCE',
  LEADERSHIP = 'LEADERSHIP',
}

export interface KudosProps {
  id?: string;
  recipientId: string;
  recipientName?: string;
  teamId?: number;
  categoryId: number;
  categoryName?: string;
  teamName?: string;
  message: string;
  createdBy: number;
  createdByName?: string;
  createdAt: Date;
  updatedAt: Date;
  deletedAt?: Date | null;
}
