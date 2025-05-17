import { LogoutRequestDto } from './logoutRequestDto';

export class LogoutUseCase {
  async execute(dto: LogoutRequestDto): Promise<void> {
    // In the context of session-based auth, the actual logout happens at the controller level
    // by destroying the session. This use case could be extended for additional logout logic
    // such as logging the logout event, notifying other systems, etc.

    if (!dto.userId) {
      throw new Error('User ID is required');
    }

    // The use case simply validates that we have a user ID
    return;
  }
}
