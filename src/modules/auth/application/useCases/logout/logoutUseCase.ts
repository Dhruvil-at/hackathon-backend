import { LogoutRequestDto } from './logoutRequestDto';

export class LogoutUseCase {
  // No need for repositories since JWT tokens are stateless

  async execute(_dto: LogoutRequestDto): Promise<void> {
    // In a JWT-based system, logout is handled client-side
    // by removing the token from storage

    // This method is kept as a placeholder for any additional server-side
    // logic that might be needed, such as token blacklisting for security purposes

    return Promise.resolve();
  }
}
