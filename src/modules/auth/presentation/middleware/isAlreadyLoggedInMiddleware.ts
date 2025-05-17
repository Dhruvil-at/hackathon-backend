import { Request, Response, NextFunction } from 'express';
import { AuthRequest } from '../interfaces/request';

export const isAlreadyLoggedInMiddleware = (
  req: Request,
  res: Response,
  next: NextFunction,
): void => {
  const authReq = req as AuthRequest;

  if (authReq.session.isAuthenticated && authReq.session.user) {
    res.status(200).json({
      success: true,
      message: 'User is already logged in',
      user: authReq.session.user,
    });
    return;
  }

  // User is not logged in, proceed to controller
  next();
};
