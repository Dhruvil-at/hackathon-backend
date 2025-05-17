import { Request, Response, NextFunction } from 'express';
import { AuthRequest } from '../../../auth/presentation/interfaces/request';

export class AuthMiddleware {
  /**
   * Middleware to check if the user is authenticated
   */
  static isAuthenticated(req: Request, res: Response, next: NextFunction): void {
    const authReq = req as AuthRequest;

    if (!authReq.user) {
      res.status(401).json({
        success: false,
        message: 'Unauthorized. Please login to access this resource.',
      });
      return;
    }

    // User is authenticated, proceed to the next middleware/controller
    next();
  }

  /**
   * Middleware to check if the user is an admin
   * This middleware should be used after isAuthenticated
   */
  static isAdmin(req: Request, res: Response, next: NextFunction): void {
    const authReq = req as AuthRequest;

    // First ensure the user is authenticated
    if (!authReq.user) {
      res.status(401).json({
        success: false,
        message: 'Unauthorized. Please login to access this resource.',
      });
      return;
    }

    // Then check if the user has the ADMIN role
    if (authReq.user.role !== 'ADMIN') {
      res.status(403).json({
        success: false,
        message: 'Forbidden. Admin privileges required for this operation.',
      });
      return;
    }

    // User is an admin, proceed to the next middleware/controller
    next();
  }
}
