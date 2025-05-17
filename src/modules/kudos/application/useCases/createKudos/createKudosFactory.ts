import { KudosRepositoryImpl } from '../../../infrastructure/repositories/kudos.repository.impl';
import { CreateKudosUseCase } from './createKudos';

export class CreateKudosFactory {
  static create() {
    const kudosRepository = new KudosRepositoryImpl();
    const useCase = new CreateKudosUseCase(kudosRepository);
    return { useCase };
  }
}
