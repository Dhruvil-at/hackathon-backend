import { Request } from 'express';
import { LoginResponseDto } from '../../application/useCases/login/loginResponseDto';
import { Session } from 'express-session';

export interface AuthRequest extends Request {
  session: Session & {
    user?: LoginResponseDto;
    isAuthenticated?: boolean;
  };
}
