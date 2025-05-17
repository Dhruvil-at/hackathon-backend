import { KudosRepositoryImpl } from '../../../infrastructure/repositories/kudos.repository.impl';
import { SearchKudosUseCase } from './searchKudos';

export class SearchKudosFactory {
  static create() {
    const kudosRepository = new KudosRepositoryImpl();
    const useCase = new SearchKudosUseCase(kudosRepository);
    return { useCase };
  }
}
