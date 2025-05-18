import { Request, Response, NextFunction } from 'express';
import { JwtServiceFactory } from '../../../../shared/jwt';

export const checkAlreadyLoggedInMiddleware = (
  req: Request,
  res: Response,
  next: NextFunction,
): void => {
  // Check for JWT token in the Authorization header
  const authHeader = req.headers.authorization;
  if (!authHeader) {
    // No token, proceed to login
    next();
    return;
  }

  const jwtService = JwtServiceFactory.create();

  const userData = jwtService.verifyToken(authHeader);

  if (!userData) {
    // Invalid or expired token, proceed to login
    next();
    return;
  }

  // User is already logged in with a valid token
  res.status(200).json({
    success: true,
    message: 'User is already logged in',
    user: userData,
  });
};
