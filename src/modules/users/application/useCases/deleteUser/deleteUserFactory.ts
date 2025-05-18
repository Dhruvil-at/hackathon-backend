import { DeleteUser } from './deleteUser';
import { UserRepositoryImpl } from '../../../infrastructure/repositories/userRepositoryImpl';

export class DeleteUserFactory {
  static create(): DeleteUser {
    const userRepository = new UserRepositoryImpl();
    return new DeleteUser(userRepository);
  }
}
