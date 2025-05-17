import { LogoutUseCase } from './logoutUseCase';

export class LogoutFactory {
  static create() {
    return new LogoutUseCase();
  }
}
