import { GetAllUsers } from './getAllUsers';
import { UserRepositoryImpl } from '../../../infrastructure/repositories/userRepositoryImpl';

export class GetAllUsersFactory {
  static create(): GetAllUsers {
    const userRepository = new UserRepositoryImpl();
    return new GetAllUsers(userRepository);
  }
}
