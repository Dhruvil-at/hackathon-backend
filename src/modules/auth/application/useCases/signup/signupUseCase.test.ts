import { SignupUseCaseImpl } from './signupUseCase';
import { UserRepository } from '../../../repositories/userRepository';
import { User } from '../../../domain/entities/user';
import { UserRole } from '../../../domain/interfaces/userRoles';

// Mock the User.create static method
jest.mock('../../../domain/entities/user', () => {
  const originalModule = jest.requireActual('../../../domain/entities/user');
  return {
    ...originalModule,
    User: {
      ...originalModule.User,
      create: jest.fn(),
    },
  };
});

describe('SignupUseCase', () => {
  // Setup mocks
  let mockUserRepository: jest.Mocked<UserRepository>;
  let signupUseCase: SignupUseCaseImpl;
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
    signupUseCase = new SignupUseCaseImpl(mockUserRepository);

    // Create mock date
    mockDate = new Date();

    // Create mock user for testing
    mockUser = {
      getId: () => 1,
      getFirstName: () => 'John',
      getLastName: () => 'Doe',
      getEmail: () => 'john@example.com',
      getPassword: () => 'password123',
      getRole: () => UserRole.TEAM_MEMBER,
      getTeamId: () => 1,
      getCreatedAt: () => mockDate,
      getUpdatedAt: () => mockDate,
      getDeletedAt: () => null,
      getFullName: () => 'John Doe',
    } as unknown as User;

    // Reset mocks
    (User.create as jest.Mock).mockClear();
    (User.create as jest.Mock).mockReturnValue(mockUser);
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  describe('execute', () => {
    it('should successfully create a new user when email does not exist', async () => {
      // Arrange
      const signupRequest = {
        firstName: 'John',
        lastName: 'Doe',
        email: 'john@example.com',
        password: 'password123',
        teamId: 1,
      };
      mockUserRepository.findByEmail.mockResolvedValue(null);
      mockUserRepository.save.mockResolvedValue();

      // Act
      const result = await signupUseCase.execute(signupRequest);

      // Assert
      expect(mockUserRepository.findByEmail).toHaveBeenCalledWith('john@example.com');
      expect(User.create).toHaveBeenCalledWith(
        expect.objectContaining({
          firstName: 'John',
          lastName: 'Doe',
          email: 'john@example.com',
          password: 'password123',
          role: UserRole.TEAM_MEMBER,
          teamId: 1,
        }),
      );
      expect(mockUserRepository.save).toHaveBeenCalledWith(mockUser);
      expect(result).toEqual({
        email: 'john@example.com',
        password: 'password123',
      });
    });

    it('should return userExists flag when email already exists', async () => {
      // Arrange
      const signupRequest = {
        firstName: 'John',
        lastName: 'Doe',
        email: 'existing@example.com',
        password: 'password123',
        teamId: 1,
      };
      mockUserRepository.findByEmail.mockResolvedValue(mockUser);

      // Act
      const result = await signupUseCase.execute(signupRequest);

      // Assert
      expect(mockUserRepository.findByEmail).toHaveBeenCalledWith('existing@example.com');
      expect(User.create).not.toHaveBeenCalled();
      expect(mockUserRepository.save).not.toHaveBeenCalled();
      expect(result).toEqual({
        email: 'existing@example.com',
        password: 'password123',
        userExists: true,
      });
    });

    it('should throw an error when User.create validation fails', async () => {
      // Arrange
      const signupRequest = {
        firstName: 'J', // Too short, will fail validation
        lastName: 'Doe',
        email: 'john@example.com',
        password: 'password123',
        teamId: 1,
      };
      mockUserRepository.findByEmail.mockResolvedValue(null);
      const validationError = new Error('First name must be at least 2 characters');
      (User.create as jest.Mock).mockImplementation(() => {
        throw validationError;
      });

      // Act & Assert
      await expect(signupUseCase.execute(signupRequest)).rejects.toThrow(
        'Failed to create user: First name must be at least 2 characters',
      );
      expect(mockUserRepository.findByEmail).toHaveBeenCalledWith('john@example.com');
      expect(User.create).toHaveBeenCalled();
      expect(mockUserRepository.save).not.toHaveBeenCalled();
    });

    it('should throw an error when email format is invalid', async () => {
      // Arrange
      const signupRequest = {
        firstName: 'John',
        lastName: 'Doe',
        email: 'invalid-email', // Invalid email format
        password: 'password123',
        teamId: 1,
      };
      mockUserRepository.findByEmail.mockResolvedValue(null);
      const validationError = new Error('Invalid email format');
      (User.create as jest.Mock).mockImplementation(() => {
        throw validationError;
      });

      // Act & Assert
      await expect(signupUseCase.execute(signupRequest)).rejects.toThrow(
        'Failed to create user: Invalid email format',
      );
      expect(mockUserRepository.findByEmail).toHaveBeenCalledWith('invalid-email');
    });

    it('should throw an error when database save operation fails', async () => {
      // Arrange
      const signupRequest = {
        firstName: 'John',
        lastName: 'Doe',
        email: 'john@example.com',
        password: 'password123',
        teamId: 1,
      };
      mockUserRepository.findByEmail.mockResolvedValue(null);
      const dbError = new Error('Database error during save');
      mockUserRepository.save.mockRejectedValue(dbError);

      // Act & Assert
      await expect(signupUseCase.execute(signupRequest)).rejects.toThrow(
        'Failed to create user: Database error during save',
      );
      expect(mockUserRepository.findByEmail).toHaveBeenCalledWith('john@example.com');
      expect(User.create).toHaveBeenCalled();
      expect(mockUserRepository.save).toHaveBeenCalledWith(mockUser);
    });

    it('should handle database errors during email check', async () => {
      // Arrange
      const signupRequest = {
        firstName: 'John',
        lastName: 'Doe',
        email: 'john@example.com',
        password: 'password123',
        teamId: 1,
      };

      // Use mockRejectedValue instead of mockImplementation to properly reject the promise
      mockUserRepository.findByEmail.mockRejectedValueOnce(new Error('Database connection error'));

      // Act & Assert
      // Use a regex pattern to match part of the error message
      await expect(signupUseCase.execute(signupRequest)).rejects.toThrow(
        /Database connection error/,
      );
      expect(mockUserRepository.findByEmail).toHaveBeenCalledWith('john@example.com');
      expect(User.create).not.toHaveBeenCalled();
    });

    it('should create user with specified teamId', async () => {
      // Arrange
      const signupRequest = {
        firstName: 'John',
        lastName: 'Doe',
        email: 'john@example.com',
        password: 'password123',
        teamId: 2, // Specific team ID
      };
      mockUserRepository.findByEmail.mockResolvedValue(null);
      mockUserRepository.save.mockResolvedValue();

      // Act
      const result = await signupUseCase.execute(signupRequest);

      // Assert
      expect(User.create).toHaveBeenCalledWith(
        expect.objectContaining({
          teamId: 2,
        }),
      );
      expect(result).toEqual({
        email: 'john@example.com',
        password: 'password123',
      });
    });
  });
});
