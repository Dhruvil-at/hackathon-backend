import { KudosRepositoryImpl } from '../../../infrastructure/repositories/kudos.repository.impl';
import { CreateKudosUseCase } from './createKudos';
import { KudosDetailsRepositoryImpl } from '../../../infrastructure/repositories/kudosDetails.repository.impl';

export class CreateKudosFactory {
  static create() {
    const kudosRepository = new KudosRepositoryImpl();
    const kudosDetailsRepository = new KudosDetailsRepositoryImpl();

    const useCase = new CreateKudosUseCase(kudosRepository, kudosDetailsRepository);

    return { useCase };
  }
}
