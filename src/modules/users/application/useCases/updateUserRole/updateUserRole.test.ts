import { UpdateUserRole } from './updateUserRole';
import { UserRepository } from '../../../repositories/userRepository';
import { User } from '../../../domain/entities/user';
import { UserRole } from '../../../domain/interfaces/userRoles';
import { UserMapper } from '../../../mappers/userMapper';

describe('UpdateUserRole', () => {
  // Setup mocks
  let mockUserRepository: jest.Mocked<UserRepository>;
  let updateUserRole: UpdateUserRole;
  let mockUser: User;
  let mockDate: Date;

  beforeEach(() => {
    // Create a fresh mock for each test
    mockUserRepository = {
      findAll: jest.fn(),
      findById: jest.fn(),
      updateRole: jest.fn(),
    } as jest.Mocked<UserRepository>;

    // Create the use case with the mock repository
    updateUserRole = new UpdateUserRole(mockUserRepository);

    // Create mock date
    mockDate = new Date();

    // Create mock user for testing
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
    } as unknown as User;

    // Spy on UserMapper without mocking its implementation
    jest.spyOn(UserMapper, 'toDto');
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  describe('execute', () => {
    it('should update user role successfully when user exists', async () => {
      // Arrange
      const request = { userId: 1, role: UserRole.TECH_LEAD };
      mockUserRepository.findById.mockResolvedValue(mockUser);
      mockUserRepository.updateRole.mockResolvedValue(mockUser);

      // Act
      const result = await updateUserRole.execute(request);

      // Assert
      expect(mockUserRepository.findById).toHaveBeenCalledWith(1);
      expect(mockUserRepository.updateRole).toHaveBeenCalledWith(1, UserRole.TECH_LEAD);
      expect(UserMapper.toDto).toHaveBeenCalledWith(mockUser);
      expect(result).toEqual({
        success: true,
        user: expect.objectContaining({
          id: 1,
          firstName: 'John',
          lastName: 'Doe',
          email: 'john@example.com',
          role: UserRole.ADMIN,
          teamId: 1,
          fullName: 'John Doe',
        }),
      });
    });

    it('should return failure when user does not exist', async () => {
      // Arrange
      const request = { userId: 999, role: UserRole.TECH_LEAD };
      mockUserRepository.findById.mockResolvedValue(null);

      // Act
      const result = await updateUserRole.execute(request);

      // Assert
      expect(mockUserRepository.findById).toHaveBeenCalledWith(999);
      expect(mockUserRepository.updateRole).not.toHaveBeenCalled();
      expect(UserMapper.toDto).not.toHaveBeenCalled();
      expect(result).toEqual({
        success: false,
      });
    });

    it('should return failure when update operation fails', async () => {
      // Arrange
      const request = { userId: 1, role: UserRole.TECH_LEAD };
      mockUserRepository.findById.mockResolvedValue(mockUser);
      mockUserRepository.updateRole.mockResolvedValue(null);

      // Act
      const result = await updateUserRole.execute(request);

      // Assert
      expect(mockUserRepository.findById).toHaveBeenCalledWith(1);
      expect(mockUserRepository.updateRole).toHaveBeenCalledWith(1, UserRole.TECH_LEAD);
      expect(UserMapper.toDto).not.toHaveBeenCalled();
      expect(result).toEqual({
        success: false,
      });
    });

    it('should throw an error when invalid role is provided', async () => {
      // Arrange
      const request = { userId: 1, role: 'INVALID_ROLE' as UserRole };
      const consoleSpy = jest.spyOn(console, 'error').mockImplementation();

      // Act
      const result = await updateUserRole.execute(request);

      // Assert
      expect(mockUserRepository.findById).not.toHaveBeenCalled();
      expect(mockUserRepository.updateRole).not.toHaveBeenCalled();
      expect(UserMapper.toDto).not.toHaveBeenCalled();
      expect(result).toEqual({
        success: false,
      });
      expect(consoleSpy).toHaveBeenCalled();
    });

    it('should handle repository errors gracefully', async () => {
      // Arrange
      const request = { userId: 1, role: UserRole.TECH_LEAD };
      const error = new Error('Database error');
      mockUserRepository.findById.mockRejectedValue(error);
      const consoleSpy = jest.spyOn(console, 'error').mockImplementation();

      // Act
      const result = await updateUserRole.execute(request);

      // Assert
      expect(mockUserRepository.findById).toHaveBeenCalledWith(1);
      expect(mockUserRepository.updateRole).not.toHaveBeenCalled();
      expect(UserMapper.toDto).not.toHaveBeenCalled();
      expect(result).toEqual({
        success: false,
      });
      expect(consoleSpy).toHaveBeenCalled();
    });

    it('should update role from TEAM_MEMBER to TECH_LEAD successfully', async () => {
      // Arrange
      const teamMemberUser = {
        ...mockUser,
        getRole: () => UserRole.TEAM_MEMBER,
      } as unknown as User;

      const updatedUser = {
        ...mockUser,
        getRole: () => UserRole.TECH_LEAD,
      } as unknown as User;

      const request = { userId: 1, role: UserRole.TECH_LEAD };
      mockUserRepository.findById.mockResolvedValue(teamMemberUser);
      mockUserRepository.updateRole.mockResolvedValue(updatedUser);

      // Act
      const result = await updateUserRole.execute(request);

      // Assert
      expect(mockUserRepository.findById).toHaveBeenCalledWith(1);
      expect(mockUserRepository.updateRole).toHaveBeenCalledWith(1, UserRole.TECH_LEAD);
      expect(UserMapper.toDto).toHaveBeenCalledWith(updatedUser);
      expect(result).toEqual({
        success: true,
        user: expect.objectContaining({
          id: 1,
          role: UserRole.TECH_LEAD,
        }),
      });
    });

    it('should update role from TECH_LEAD to ADMIN successfully', async () => {
      // Arrange
      const techLeadUser = {
        ...mockUser,
        getRole: () => UserRole.TECH_LEAD,
      } as unknown as User;

      const updatedUser = {
        ...mockUser,
        getRole: () => UserRole.ADMIN,
      } as unknown as User;

      const request = { userId: 1, role: UserRole.ADMIN };
      mockUserRepository.findById.mockResolvedValue(techLeadUser);
      mockUserRepository.updateRole.mockResolvedValue(updatedUser);

      // Act
      const result = await updateUserRole.execute(request);

      // Assert
      expect(mockUserRepository.findById).toHaveBeenCalledWith(1);
      expect(mockUserRepository.updateRole).toHaveBeenCalledWith(1, UserRole.ADMIN);
      expect(UserMapper.toDto).toHaveBeenCalledWith(updatedUser);
      expect(result).toEqual({
        success: true,
        user: expect.objectContaining({
          id: 1,
          role: UserRole.ADMIN,
        }),
      });
    });

    it('should handle specific database errors with appropriate message', async () => {
      // Arrange
      const request = { userId: 1, role: UserRole.TECH_LEAD };
      const specificError = new Error('Foreign key constraint violation');
      mockUserRepository.findById.mockResolvedValue(mockUser);
      mockUserRepository.updateRole.mockRejectedValue(specificError);
      const consoleSpy = jest.spyOn(console, 'error').mockImplementation();

      // Act
      const result = await updateUserRole.execute(request);

      // Assert
      expect(mockUserRepository.findById).toHaveBeenCalledWith(1);
      expect(mockUserRepository.updateRole).toHaveBeenCalledWith(1, UserRole.TECH_LEAD);
      expect(UserMapper.toDto).not.toHaveBeenCalled();
      expect(result).toEqual({
        success: false,
      });
      expect(consoleSpy).toHaveBeenCalledWith(
        'Error updating user role:',
        expect.objectContaining({ message: 'Foreign key constraint violation' }),
      );
    });

    it('should propagate validation errors from validateRole method', async () => {
      // This test checks if the validateRole method correctly throws errors for invalid roles
      // We can simulate this by providing a role that's not in the UserRole enum but cast to the type

      // Arrange
      const request = { userId: 1, role: 'NOT_A_ROLE' as UserRole };
      const consoleSpy = jest.spyOn(console, 'error').mockImplementation();

      // Act
      const result = await updateUserRole.execute(request);

      // Assert
      expect(mockUserRepository.findById).not.toHaveBeenCalled();
      expect(mockUserRepository.updateRole).not.toHaveBeenCalled();
      expect(result).toEqual({
        success: false,
      });
      expect(consoleSpy).toHaveBeenCalled();
    });
  });
});
