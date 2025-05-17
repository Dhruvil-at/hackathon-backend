import { UserRepository } from '../../../repositories/userRepository';
import { UpdateUserRoleRequestDto } from './updateUserRoleRequestDto';
import { UpdateUserRoleResponseDto } from './updateUserRoleResponseDto';
import { UserMapper } from '../../../mappers/userMapper';
import { UserRole } from '../../../domain/interfaces/userRoles';

export class UpdateUserRole {
  constructor(private userRepository: UserRepository) {}

  async execute(request: UpdateUserRoleRequestDto): Promise<UpdateUserRoleResponseDto> {
    try {
      // Validate that the role is a valid UserRole
      this.validateRole(request.role);

      // Find user by ID
      const user = await this.userRepository.findById(request.userId);

      // If user not found, return failure response
      if (!user) {
        return {
          success: false,
        };
      }

      // Update the user's role
      const updatedUser = await this.userRepository.updateRole(request.userId, request.role);

      // If update failed, return failure response
      if (!updatedUser) {
        return {
          success: false,
        };
      }

      // Return success response with updated user
      return {
        success: true,
        user: UserMapper.toDto(updatedUser),
      };
    } catch (error) {
      console.error('Error updating user role:', error);
      return {
        success: false,
      };
    }
  }

  // Validate that the role is a valid UserRole value
  private validateRole(role: UserRole): void {
    const validRoles = Object.values(UserRole);
    if (!validRoles.includes(role)) {
      throw new Error(`Invalid role: ${role}. Must be one of: ${validRoles.join(', ')}`);
    }
  }
}
