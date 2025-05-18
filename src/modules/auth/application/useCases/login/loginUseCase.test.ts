import { LoginUseCase } from './loginUseCase';
import { UserRepository } from '../../../repositories/userRepository';
import { User } from '../../../domain/entities/user';
import { UserRole } from '../../../domain/interfaces/userRoles';

describe('LoginUseCase', () => {
  // Setup mocks
  let mockUserRepository: jest.Mocked<UserRepository>;
  let loginUseCase: LoginUseCase;
  let mockUser: User;
  let mockDate: Date;

  beforeEach(() => {
    // Create a fresh mock for each test
    mockUserRepository = {
      findByEmail: jest.fn(),
      findById: jest.fn(),
      save: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
      searchByName: jest.fn(),
    } as jest.Mocked<UserRepository>;

    // Create the use case with the mock repository
    loginUseCase = new LoginUseCase(mockUserRepository);

    // Create mock date
    mockDate = new Date();

    // Create mock user for testing with comparePassword method
    mockUser = {
      getId: () => 1,
      getFirstName: () => 'John',
      getLastName: () => 'Doe',
      getEmail: () => 'john@example.com',
      getPassword: () => 'password123',
      getRole: () => UserRole.ADMIN,
      getTeamId: () => 1,
      getCreatedAt: () => mockDate,
      getUpdatedAt: () => mockDate,
      getDeletedAt: () => null,
      getFullName: () => 'John Doe',
      comparePassword: jest
        .fn()
        .mockImplementation((password) => Promise.resolve(password === 'password123')),
    } as unknown as User;
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  describe('execute', () => {
    it('should successfully login a user with valid credentials', async () => {
      // Arrange
      const loginRequest = { email: 'john@example.com', password: 'password123' };
      mockUserRepository.findByEmail.mockResolvedValue(mockUser);

      // Act
      const result = await loginUseCase.execute(loginRequest);

      // Assert
      expect(mockUserRepository.findByEmail).toHaveBeenCalledWith('john@example.com');
      expect(mockUser.comparePassword).toHaveBeenCalledWith('password123');
      expect(result).toEqual(
        expect.objectContaining({
          id: 1,
          firstName: 'John',
          lastName: 'Doe',
          fullName: 'John Doe',
          email: 'john@example.com',
          role: UserRole.ADMIN,
          teamId: 1,
        }),
      );
    });

    it('should throw an error if email is missing', async () => {
      // Arrange
      const loginRequest = { email: '', password: 'password123' };

      // Act & Assert
      await expect(loginUseCase.execute(loginRequest)).rejects.toThrow(
        'Email and password are required',
      );
      expect(mockUserRepository.findByEmail).not.toHaveBeenCalled();
    });

    it('should throw an error if password is missing', async () => {
      // Arrange
      const loginRequest = { email: 'john@example.com', password: '' };

      // Act & Assert
      await expect(loginUseCase.execute(loginRequest)).rejects.toThrow(
        'Email and password are required',
      );
      expect(mockUserRepository.findByEmail).not.toHaveBeenCalled();
    });

    it('should throw an error if user is not found', async () => {
      // Arrange
      const loginRequest = { email: 'nonexistent@example.com', password: 'password123' };
      mockUserRepository.findByEmail.mockResolvedValue(null);

      // Act & Assert
      await expect(loginUseCase.execute(loginRequest)).rejects.toThrow('Invalid credentials');
      expect(mockUserRepository.findByEmail).toHaveBeenCalledWith('nonexistent@example.com');
    });

    it('should throw an error if password is incorrect', async () => {
      // Arrange
      const loginRequest = { email: 'john@example.com', password: 'wrongpassword' };
      mockUserRepository.findByEmail.mockResolvedValue(mockUser);

      // Act & Assert
      await expect(loginUseCase.execute(loginRequest)).rejects.toThrow('Invalid credentials');
      expect(mockUserRepository.findByEmail).toHaveBeenCalledWith('john@example.com');
      expect(mockUser.comparePassword).toHaveBeenCalledWith('wrongpassword');
    });

    it('should handle database errors when finding user', async () => {
      // Arrange
      const loginRequest = { email: 'john@example.com', password: 'password123' };
      const dbError = new Error('Database connection error');
      mockUserRepository.findByEmail.mockRejectedValue(dbError);

      // Act & Assert
      await expect(loginUseCase.execute(loginRequest)).rejects.toThrow('Database connection error');
      expect(mockUserRepository.findByEmail).toHaveBeenCalledWith('john@example.com');
    });

    it('should handle errors during password comparison', async () => {
      // Arrange
      const loginRequest = { email: 'john@example.com', password: 'password123' };
      mockUserRepository.findByEmail.mockResolvedValue(mockUser);
      const compareError = new Error('Password comparison failed');
      (mockUser.comparePassword as jest.Mock).mockRejectedValue(compareError);

      // Act & Assert
      await expect(loginUseCase.execute(loginRequest)).rejects.toThrow(
        'Password comparison failed',
      );
      expect(mockUserRepository.findByEmail).toHaveBeenCalledWith('john@example.com');
      expect(mockUser.comparePassword).toHaveBeenCalledWith('password123');
    });

    it('should return user with correct team member role', async () => {
      // Arrange
      const teamMemberUser = {
        ...mockUser,
        getRole: () => UserRole.TEAM_MEMBER,
      } as unknown as User;

      const loginRequest = { email: 'john@example.com', password: 'password123' };
      mockUserRepository.findByEmail.mockResolvedValue(teamMemberUser);

      // Act
      const result = await loginUseCase.execute(loginRequest);

      // Assert
      expect(result).toEqual(
        expect.objectContaining({
          id: 1,
          role: UserRole.TEAM_MEMBER,
        }),
      );
    });

    it('should return null teamId when user has no team', async () => {
      // Arrange
      const userWithoutTeam = {
        ...mockUser,
        getTeamId: () => null,
      } as unknown as User;

      const loginRequest = { email: 'john@example.com', password: 'password123' };
      mockUserRepository.findByEmail.mockResolvedValue(userWithoutTeam);

      // Act
      const result = await loginUseCase.execute(loginRequest);

      // Assert
      expect(result).toEqual(
        expect.objectContaining({
          id: 1,
          teamId: null,
        }),
      );
    });
  });
});
