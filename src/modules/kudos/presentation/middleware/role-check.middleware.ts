import { Request, Response, NextFunction } from 'express';
import { AuthRequest } from 'src/modules/auth/presentation/interfaces/request';

export const isTechLead = (req: Request, res: Response, next: NextFunction) => {
  const authReq = req as AuthRequest;
  const user = authReq.user;

  if (!user) {
    res.status(401).json({
      success: false,
      message: 'User not authenticated',
    });
    return;
  }

  if (user.role !== 'TECH_LEAD' && user.role !== 'ADMIN') {
    res.status(403).json({
      success: false,
      message: 'Only Tech Leads can create kudos',
    });
    return;
  }

  next();
};
