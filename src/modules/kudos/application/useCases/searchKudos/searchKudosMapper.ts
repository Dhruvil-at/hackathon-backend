import { Kudos } from '../../../domain/entities/kudos.entity';
import { SearchKudosResponseDto } from './searchKudosResponseDto';
import { KudosItemDto } from '../listKudos/listKudosResponseDto';
import { ListKudosMapper } from '../listKudos/listKudosMapper';

export class SearchKudosMapper {
  static toDto(kudos: Kudos[], total: number): SearchKudosResponseDto {
    const kudosList: KudosItemDto[] = kudos.map((item) => ListKudosMapper.toItemDto(item));

    return {
      kudos: kudosList,
      total,
    };
  }
}
