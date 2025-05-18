import { Request, Response, NextFunction } from 'express';
import { JwtServiceFactory } from '../jwt';
import { UserRole } from '../../modules/auth/domain/interfaces/userRoles';

// Interface for the augmented request with user data
export interface user {
  id: number;
  firstName: string;
  lastName: string;
  fullName: string;
  email: string;
  role: UserRole;
  teamId: number | null;
}
export interface AuthRequest extends Request {
  user?: user;
}

export const jwtAuthMiddleware = (req: Request, res: Response, next: NextFunction): void => {


  const authHeader = req.headers.authorization;
  const jwtService = JwtServiceFactory.create();

  // Extract token from header

  if (!authHeader) {
    res.status(401).json({
      success: false,
      message: 'Authentication token is missing',
    });
    return;
  }

  // Verify token
  const userData = jwtService.verifyToken(authHeader);

  if (!userData) {
    res.status(401).json({
      success: false,
      message: 'Invalid or expired authentication token',
    });
    return;
  }

  // Add user data to request
  const authReq = req as AuthRequest;
  authReq.user = userData;

  next();
};
