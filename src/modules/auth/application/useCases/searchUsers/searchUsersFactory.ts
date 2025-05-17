import { UserRepositoryImpl } from '../../../infrastructure/repositories/userRepositoryImpl';
import { SearchUsersUseCase } from './searchUsersUseCase';

export class SearchUsersFactory {
  static create(): SearchUsersUseCase {
    const userRepository = new UserRepositoryImpl();
    const searchUsersUseCase = new SearchUsersUseCase(userRepository);
    return searchUsersUseCase;
  }
}
