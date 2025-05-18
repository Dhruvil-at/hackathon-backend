import jwt, { SignOptions } from 'jsonwebtoken';
import { LoginResponseDto } from '../../modules/auth/application/useCases/login/loginResponseDto';

// Extended payload type to include sessionId for multi-browser support
export type JwtPayload = LoginResponseDto & {
  sessionId?: string;
  iat?: number;
  exp?: number;
};

export class JwtService {
  private readonly JWT_SECRET: string;
  private readonly JWT_EXPIRES_IN: string;

  constructor() {
    // Use environment variables for production, using fallbacks for development
    this.JWT_SECRET = process.env.JWT_SECRET || 'hackathon-super-secret-key';
    this.JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '24h';
  }

  generateToken(payload: JwtPayload): string {
    // Explicit cast of expiresIn to a type accepted by jsonwebtoken
    const expiresIn = this.JWT_EXPIRES_IN as jwt.SignOptions['expiresIn'];

    const options: SignOptions = { expiresIn };

    // Convert to Buffer to avoid type issues
    const secretBuffer = Buffer.from(this.JWT_SECRET, 'utf8');

    return jwt.sign(payload as object, secretBuffer, options);
  }

  verifyToken(token: string): JwtPayload | null {
    try {
      // Convert to Buffer to avoid type issues
      const secretBuffer = Buffer.from(this.JWT_SECRET, 'utf8');

      return jwt.verify(token, secretBuffer) as JwtPayload;
    } catch (error) {
      return null;
    }
  }

  extractTokenFromHeader(authHeader: string | undefined): string | null {
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return null;
    }

    return authHeader.split(' ')[1];
  }
}
