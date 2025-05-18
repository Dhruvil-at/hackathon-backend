import { SearchUsersUseCase } from './searchUsersUseCase';
import { UserRepository } from '../../../repositories/userRepository';
import { User } from '../../../domain/entities/user';
import { UserRole } from '../../../domain/interfaces/userRoles';
import { SearchUsersDtoMapper } from './searchUsersDtoMapper';

describe('SearchUsersUseCase', () => {
  // Setup mocks
  let mockUserRepository: jest.Mocked<UserRepository>;
  let searchUsersUseCase: SearchUsersUseCase;
  let mockUsers: User[];
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
    searchUsersUseCase = new SearchUsersUseCase(mockUserRepository);

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

    // Spy on SearchUsersDtoMapper without mocking its implementation
    jest.spyOn(SearchUsersDtoMapper, 'toDto');
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  describe('execute', () => {
    it('should return users matching the search text', async () => {
      // Arrange
      const searchRequest = { searchText: 'John' };
      mockUserRepository.searchByName.mockResolvedValue([mockUsers[0]]);

      // Act
      const result = await searchUsersUseCase.execute(searchRequest);

      // Assert
      expect(mockUserRepository.searchByName).toHaveBeenCalledWith('John');
      expect(SearchUsersDtoMapper.toDto).toHaveBeenCalledWith([mockUsers[0]]);
      expect(result).toEqual({
        users: [
          expect.objectContaining({
            id: 1,
            firstName: 'John',
            lastName: 'Doe',
            email: 'john@example.com',
            role: UserRole.ADMIN,
            teamId: 1,
          }),
        ],
        found: true,
        count: 1,
      });
    });

    it('should return empty array when no users match', async () => {
      // Arrange
      const searchRequest = { searchText: 'NonExistent' };
      mockUserRepository.searchByName.mockResolvedValue([]);

      // Act
      const result = await searchUsersUseCase.execute(searchRequest);

      // Assert
      expect(mockUserRepository.searchByName).toHaveBeenCalledWith('NonExistent');
      expect(SearchUsersDtoMapper.toDto).toHaveBeenCalledWith([]);
      expect(result).toEqual({
        users: [],
        found: false,
        count: 0,
      });
    });

    it('should return multiple users when multiple matches found', async () => {
      // Arrange
      const searchRequest = { searchText: 'Jo' }; // Partial match for both John and Jane
      mockUserRepository.searchByName.mockResolvedValue(mockUsers);

      // Act
      const result = await searchUsersUseCase.execute(searchRequest);

      // Assert
      expect(mockUserRepository.searchByName).toHaveBeenCalledWith('Jo');
      expect(SearchUsersDtoMapper.toDto).toHaveBeenCalledWith(mockUsers);
      expect(result.users.length).toBe(2);
      expect(result).toEqual({
        users: [
          expect.objectContaining({ id: 1, firstName: 'John' }),
          expect.objectContaining({ id: 2, firstName: 'Jane' }),
        ],
        found: true,
        count: 2,
      });
    });

    it('should handle empty search text', async () => {
      // Arrange
      const searchRequest = { searchText: '' };
      mockUserRepository.searchByName.mockResolvedValue([]);

      // Act
      const result = await searchUsersUseCase.execute(searchRequest);

      // Assert
      expect(mockUserRepository.searchByName).toHaveBeenCalledWith('');
      expect(result).toEqual({
        users: [],
        found: false,
        count: 0,
      });
    });

    it('should propagate repository errors', async () => {
      // Arrange
      const searchRequest = { searchText: 'John' };
      const error = new Error('Database error');
      mockUserRepository.searchByName.mockRejectedValue(error);

      // Act & Assert
      await expect(searchUsersUseCase.execute(searchRequest)).rejects.toThrow('Database error');
      expect(mockUserRepository.searchByName).toHaveBeenCalledWith('John');
    });
  });
});
