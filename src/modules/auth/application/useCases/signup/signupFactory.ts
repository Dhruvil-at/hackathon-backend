import { UserRepositoryImpl } from '../../../infrastructure/repositories/userRepositoryImpl';
import { SignupUseCaseImpl } from './signupUseCase';

export class SignupFactory {
  static create(): SignupUseCaseImpl {
    const userRepository = new UserRepositoryImpl();
    return new SignupUseCaseImpl(userRepository);
  }
}
