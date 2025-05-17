import { KudosRepositoryImpl } from '../../../infrastructure/repositories/kudos.repository.impl';
import { GetKudosByIdUseCase } from './getKudosById';

export class GetKudosByIdFactory {
  static create() {
    const kudosRepository = new KudosRepositoryImpl();
    const useCase = new GetKudosByIdUseCase(kudosRepository);
    return { useCase };
  }
}
