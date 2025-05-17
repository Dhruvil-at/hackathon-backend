import { KudosItemDto } from '../listKudos/listKudosResponseDto';

export interface SearchKudosResponseDto {
  kudos: KudosItemDto[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
  query: string;
}
