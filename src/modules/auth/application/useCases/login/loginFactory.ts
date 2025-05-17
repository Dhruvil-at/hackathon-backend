import { UserRepositoryImpl } from '../../../infrastructure/repositories/userRepositoryImpl';
import { LoginUseCase } from './loginUseCase';

export class LoginFactory {
  static create() {
    const userRepository = new UserRepositoryImpl();
    const loginUseCase = new LoginUseCase(userRepository);
    return loginUseCase;
  }
}
