import { KudosRepositoryImpl } from '../../../infrastructure/repositories/kudos.repository.impl';
import { ListKudosUseCase } from './listKudos';

export class ListKudosFactory {
  static create() {
    const kudosRepository = new KudosRepositoryImpl();
    const useCase = new ListKudosUseCase(kudosRepository);
    return { useCase };
  }
}
