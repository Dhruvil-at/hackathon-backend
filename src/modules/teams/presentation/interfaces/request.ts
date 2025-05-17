import { Request } from 'express';
import { Session } from 'express-session';
import { LoginResponseDto } from '../../../auth/application/useCases/login/loginResponseDto';

export interface TeamRequest extends Request {
  session: Session & {
    // Can add team-specific session data here if needed
    user?: LoginResponseDto;
    isAuthenticated?: boolean;
  };
}
