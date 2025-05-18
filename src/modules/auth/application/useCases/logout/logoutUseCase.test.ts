import { LogoutUseCase } from './logoutUseCase';

describe('LogoutUseCase', () => {
  let logoutUseCase: LogoutUseCase;

  beforeEach(() => {
    // Create the use case
    logoutUseCase = new LogoutUseCase();
  });

  describe('execute', () => {
    it('should resolve successfully', async () => {
      // Arrange
      const logoutRequest = { userId: 1 };

      // Act & Assert
      await expect(logoutUseCase.execute(logoutRequest)).resolves.toBeUndefined();
    });

    it('should work with different user IDs', async () => {
      // Arrange
      const logoutRequest = { userId: 2 };

      // Act & Assert
      await expect(logoutUseCase.execute(logoutRequest)).resolves.toBeUndefined();
    });
  });
});
