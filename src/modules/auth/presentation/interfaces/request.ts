import { Request } from 'express';
import { LoginResponseDto } from '../../application/useCases/login/loginResponseDto';

export interface AuthRequest extends Request {
  user?: LoginResponseDto & {
    sessionId?: string; // Added for multi-browser support
  };
}
