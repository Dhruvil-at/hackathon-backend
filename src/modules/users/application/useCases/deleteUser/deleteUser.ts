import { UserRepository } from '../../../repositories/userRepository';
import { User } from '../../../domain/entities/user';

export interface DeleteUserResult {
  success: boolean;
  user?: User;
  message?: string;
}

export class DeleteUser {
  constructor(private userRepository: UserRepository) {}

  async execute(userId: number): Promise<DeleteUserResult> {
    try {
      // Check if user exists
      const existingUser = await this.userRepository.findById(userId);
      if (!existingUser) {
        return {
          success: false,
          message: 'User not found',
        };
      }

      // Soft delete the user by setting deletedAt
      const deletedUser = await this.userRepository.softDelete(userId);

      if (!deletedUser) {
        return {
          success: false,
          message: 'Failed to delete user',
        };
      }

      return {
        success: true,
        user: deletedUser,
        message: 'User deleted successfully',
      };
    } catch (error) {
      return {
        success: false,
        message: error.message || 'An error occurred while deleting the user',
      };
    }
  }
}
