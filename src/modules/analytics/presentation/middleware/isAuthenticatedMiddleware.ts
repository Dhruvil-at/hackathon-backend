import { Request, Response, NextFunction } from 'express';
import { AuthRequest } from '../../../auth/presentation/interfaces/request';

export const isAuthenticatedMiddleware = (
  req: Request,
  res: Response,
  next: NextFunction,
): void => {
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
};
