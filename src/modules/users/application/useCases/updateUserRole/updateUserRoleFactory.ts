import { UpdateUserRole } from './updateUserRole';
import { UserRepositoryImpl } from '../../../infrastructure/repositories/userRepositoryImpl';

export class UpdateUserRoleFactory {
  static create(): UpdateUserRole {
    const userRepository = new UserRepositoryImpl();
    return new UpdateUserRole(userRepository);
  }
}
