import { Request, Response, NextFunction } from 'express';
import { AuthRequest } from './jwtAuthMiddleware';

export const adminTechLeadMiddleware = (req: Request, res: Response, next: NextFunction) => {
  try {
    const authReq = req as AuthRequest;

    // Get user from JWT token
    const user = authReq.user;

    // Check if user is authenticated
    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Authentication required',
      });
    }

    // Check if user has ADMIN or TECH_LEAD role
    if (user.role !== 'ADMIN' && user.role !== 'TECH_LEAD') {
      return res.status(403).json({
        success: false,
        message: 'Forbidden. Admin or Tech Lead privileges required for this operation.',
      });
    }

    next();
    return;
  } catch (error) {
    console.error('Auth middleware error:', error);
    return res.status(500).json({
      success: false,
      message: 'Internal server error',
    });
  }
};
