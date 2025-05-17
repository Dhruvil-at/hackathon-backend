import { KudosItemDto } from '../listKudos/listKudosResponseDto';

export interface SearchKudosResponseDto {
  kudos: KudosItemDto[];
  total: number;
}
