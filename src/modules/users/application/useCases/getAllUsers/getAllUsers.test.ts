import { GetAllUsers } from './getAllUsers';
import { UserRepository } from '../../../repositories/userRepository';
import { GetAllUsersResponseMapper } from './getAllUsersResponseMapper';
import { User } from '../../../domain/entities/user';
import { UserRole } from '../../../domain/interfaces/userRoles';

describe('GetAllUsers', () => {
  // Setup mocks
  let mockUserRepository: jest.Mocked<UserRepository>;
  let getAllUsers: GetAllUsers;
  let mockUsers: User[];
  let mockDate: Date;

  beforeEach(() => {
    // Create a fresh mock for each test
    mockUserRepository = {
      findAll: jest.fn(),
      findById: jest.fn(),
      updateRole: jest.fn(),
      softDelete: jest.fn(),
    } as jest.Mocked<UserRepository>;

    // Create the use case with the mock repository
    getAllUsers = new GetAllUsers(mockUserRepository);

    // Create mock date
    mockDate = new Date();

    // Create mock users for testing
    mockUsers = [
      {
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
      } as unknown as User,
      {
        getId: () => 2,
        getFirstName: () => 'Jane',
        getLastName: () => 'Smith',
        getEmail: () => 'jane@example.com',
        getPassword: () => 'password456',
        getRole: () => UserRole.TEAM_MEMBER,
        getTeamId: () => 2,
        getCreatedAt: () => mockDate,
        getUpdatedAt: () => mockDate,
        getDeletedAt: () => null,
        getFullName: () => 'Jane Smith',
      } as unknown as User,
    ];

    // Spy on GetAllUsersResponseMapper without mocking its implementation
    jest.spyOn(GetAllUsersResponseMapper, 'toDto');
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  describe('execute', () => {
    it('should return all users when no filters are provided', async () => {
      // Arrange
      mockUserRepository.findAll.mockResolvedValue({ users: mockUsers, total: 2 });

      // Act
      const result = await getAllUsers.execute();

      // Assert
      expect(mockUserRepository.findAll).toHaveBeenCalledWith({});
      expect(GetAllUsersResponseMapper.toDto).toHaveBeenCalledTimes(2);
      expect(result).toEqual({
        users: expect.arrayContaining([
          expect.objectContaining({
            id: 1,
            firstName: 'John',
            lastName: 'Doe',
            email: 'john@example.com',
            role: UserRole.ADMIN,
            teamId: 1,
            fullName: 'John Doe',
          }),
          expect.objectContaining({
            id: 2,
            firstName: 'Jane',
            lastName: 'Smith',
            email: 'jane@example.com',
            role: UserRole.TEAM_MEMBER,
            teamId: 2,
            fullName: 'Jane Smith',
          }),
        ]),
        total: 2,
      });
    });

    it('should apply role filter when provided', async () => {
      // Arrange
      const request = { role: UserRole.ADMIN };
      mockUserRepository.findAll.mockResolvedValue({
        users: [mockUsers[0]],
        total: 1,
      });

      // Act
      const result = await getAllUsers.execute(request);

      // Assert
      expect(mockUserRepository.findAll).toHaveBeenCalledWith({ role: UserRole.ADMIN });
      expect(GetAllUsersResponseMapper.toDto).toHaveBeenCalledTimes(1);
      expect(result).toEqual({
        users: [
          expect.objectContaining({
            id: 1,
            firstName: 'John',
            lastName: 'Doe',
            email: 'john@example.com',
            role: UserRole.ADMIN,
            teamId: 1,
            fullName: 'John Doe',
          }),
        ],
        total: 1,
      });
    });

    it('should apply teamId filter when provided', async () => {
      // Arrange
      const request = { teamId: 2 };
      mockUserRepository.findAll.mockResolvedValue({
        users: [mockUsers[1]],
        total: 1,
      });

      // Act
      const result = await getAllUsers.execute(request);

      // Assert
      expect(mockUserRepository.findAll).toHaveBeenCalledWith({ teamId: 2 });
      expect(result).toEqual({
        users: [
          expect.objectContaining({
            id: 2,
            firstName: 'Jane',
            lastName: 'Smith',
            email: 'jane@example.com',
            role: UserRole.TEAM_MEMBER,
            teamId: 2,
            fullName: 'Jane Smith',
          }),
        ],
        total: 1,
      });
    });

    it('should apply pagination parameters when provided', async () => {
      // Arrange
      const request = { page: 1, limit: 10 };
      mockUserRepository.findAll.mockResolvedValue({ users: mockUsers, total: 2 });

      // Act
      const result = await getAllUsers.execute(request);

      // Assert
      expect(mockUserRepository.findAll).toHaveBeenCalledWith({ page: 1, limit: 10 });
      expect(result).toEqual({
        users: [
          expect.objectContaining({
            id: 1,
            firstName: 'John',
            lastName: 'Doe',
          }),
          expect.objectContaining({
            id: 2,
            firstName: 'Jane',
            lastName: 'Smith',
          }),
        ],
        total: 2,
      });
    });

    it('should apply sort order when provided', async () => {
      // Arrange
      const request = { sortOrder: 'desc' as const };
      mockUserRepository.findAll.mockResolvedValue({ users: mockUsers, total: 2 });

      // Act
      const result = await getAllUsers.execute(request);

      // Assert
      expect(mockUserRepository.findAll).toHaveBeenCalledWith({ sortOrder: 'desc' });
      expect(result).toEqual({
        users: expect.arrayContaining([
          expect.objectContaining({
            id: 1,
            firstName: 'John',
          }),
          expect.objectContaining({
            id: 2,
            firstName: 'Jane',
          }),
        ]),
        total: 2,
      });
    });

    it('should handle empty result from repository', async () => {
      // Arrange
      mockUserRepository.findAll.mockResolvedValue({ users: [], total: 0 });

      // Act
      const result = await getAllUsers.execute();

      // Assert
      expect(mockUserRepository.findAll).toHaveBeenCalled();
      expect(result).toEqual({
        users: [],
        total: 0,
      });
    });

    it('should propagate errors from repository', async () => {
      // Arrange
      const error = new Error('Database error');
      mockUserRepository.findAll.mockRejectedValueOnce(error);

      // Act & Assert
      await expect(getAllUsers.execute()).rejects.toThrow('Database error');
      expect(mockUserRepository.findAll).toHaveBeenCalled();
    });

    it('should apply both role and teamId filters when provided together', async () => {
      // Arrange
      const request = { role: UserRole.TEAM_MEMBER, teamId: 2 };
      mockUserRepository.findAll.mockResolvedValue({
        users: [mockUsers[1]],
        total: 1,
      });

      // Act
      const result = await getAllUsers.execute(request);

      // Assert
      expect(mockUserRepository.findAll).toHaveBeenCalledWith({
        role: UserRole.TEAM_MEMBER,
        teamId: 2,
      });
      expect(result).toEqual({
        users: [
          expect.objectContaining({
            id: 2,
            firstName: 'Jane',
            lastName: 'Smith',
            role: UserRole.TEAM_MEMBER,
            teamId: 2,
          }),
        ],
        total: 1,
      });
    });

    it('should apply ascending sort order when provided', async () => {
      // Arrange
      const request = { sortOrder: 'asc' as const };
      mockUserRepository.findAll.mockResolvedValue({
        users: [mockUsers[0], mockUsers[1]],
        total: 2,
      });

      // Act
      const result = await getAllUsers.execute(request);

      // Assert
      expect(mockUserRepository.findAll).toHaveBeenCalledWith({ sortOrder: 'asc' });
      expect(result.users.length).toBe(2);
      expect(result.users[0]).toEqual(
        expect.objectContaining({
          id: 1,
          firstName: 'John',
        }),
      );
      expect(result.users[1]).toEqual(
        expect.objectContaining({
          id: 2,
          firstName: 'Jane',
        }),
      );
    });

    it('should handle different pagination values correctly', async () => {
      // Arrange
      const request = { page: 2, limit: 5 };
      mockUserRepository.findAll.mockResolvedValue({
        users: [mockUsers[1]],
        total: 6, // Simulating 6 total users with 5 per page, so page 2 has 1 user
      });

      // Act
      const result = await getAllUsers.execute(request);

      // Assert
      expect(mockUserRepository.findAll).toHaveBeenCalledWith({ page: 2, limit: 5 });
      expect(result).toEqual({
        users: [
          expect.objectContaining({
            id: 2,
            firstName: 'Jane',
          }),
        ],
        total: 6,
      });
    });

    it('should handle zero pagination limit gracefully', async () => {
      // Arrange
      const request = { limit: 0 };
      mockUserRepository.findAll.mockResolvedValue({
        users: [],
        total: 2, // There are users but none returned due to limit 0
      });

      // Act
      const result = await getAllUsers.execute(request);

      // Assert
      expect(mockUserRepository.findAll).toHaveBeenCalledWith({ limit: 0 });
      expect(result).toEqual({
        users: [],
        total: 2,
      });
    });
  });
});
