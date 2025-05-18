import { Request, Response, NextFunction } from 'express';
import { GetAllUsersFactory } from '../../application/useCases/getAllUsers/getAllUsersFactory';
import { UpdateUserRoleFactory } from '../../application/useCases/updateUserRole/updateUserRoleFactory';
import { DeleteUserFactory } from '../../application/useCases/deleteUser/deleteUserFactory';
import { UserRole } from '../../domain/interfaces/userRoles';

export class UserController {
  static async getAllUsers(req: Request, res: Response, next: NextFunction) {
    try {
      // Extract query parameters with type conversions
      const { role, teamId, page, limit, sortOrder } = req.query;

      const filters = {
        ...(role && { role: role as string }),
        ...(teamId && { teamId: parseInt(teamId as string) }),
        ...(page && { page: parseInt(page as string) }),
        ...(limit && { limit: parseInt(limit as string) }),
        ...(sortOrder && { sortOrder: sortOrder as 'asc' | 'desc' }),
      };

      // Create and execute use case to get all users
      const getAllUsersUseCase = GetAllUsersFactory.create();
      const result = await getAllUsersUseCase.execute(filters);

      // Return success response with users and pagination metadata
      res.status(200).json({
        success: true,
        data: result,
      });
    } catch (error) {
      // Handle errors
      res.status(500).json({
        success: false,
        message: error.message || 'Failed to retrieve users',
      });
      console.error('Get all users error:', error);
      next(error);
    }
  }

  static async updateUserRole(req: Request, res: Response, next: NextFunction) {
    try {
      const { role, userId, teamId } = req.body;

      // Create and execute use case to update user role
      const updateUserRoleUseCase = UpdateUserRoleFactory.create();
      const result = await updateUserRoleUseCase.execute({
        userId,
        role: role as UserRole,
        teamId,
      });

      // If update failed, return appropriate error response
      if (!result.success) {
        return res.status(404).json({
          success: false,
          message: 'User not found or role update failed',
        });
      }

      // Return success response with updated user
      res.status(200).json({
        success: true,
        message: 'User role updated successfully',
        data: result.user,
      });
      return;
    } catch (error) {
      // Handle errors
      res.status(400).json({
        success: false,
        message: error.message || 'Failed to update user role',
      });
      console.error('Update user role error:', error);
      next(error);
      return;
    }
  }

  static async deleteUser(req: Request, res: Response, next: NextFunction) {
    try {
      const { userId } = req.body;

      // Create and execute use case to delete user
      const deleteUserUseCase = DeleteUserFactory.create();
      const result = await deleteUserUseCase.execute(userId);

      // If delete failed, return appropriate error response
      if (!result.success) {
        return res.status(404).json({
          success: false,
          message: result.message || 'User not found or deletion failed',
        });
      }

      // Return success response
      res.status(200).json({
        success: true,
        message: result.message || 'User deleted successfully',
        data: result.user,
      });
      return;
    } catch (error) {
      // Handle errors
      res.status(400).json({
        success: false,
        message: error.message || 'Failed to delete user',
      });
      console.error('Delete user error:', error);
      next(error);
      return;
    }
  }
}
