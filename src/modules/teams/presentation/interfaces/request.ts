import { Request } from 'express';
import { LoginResponseDto } from '../../../auth/application/useCases/login/loginResponseDto';

export interface TeamRequest extends Request {
  user?: LoginResponseDto & {
    sessionId?: string;
  };
}
