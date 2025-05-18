import { Request, Response, NextFunction } from 'express';
import { LoginFactory } from '../../application/useCases/login/loginFactory';
import { LogoutFactory } from '../../application/useCases/logout/logoutFactory';
import { SignupFactory } from '../../application/useCases/signup/signupFactory';
import { SearchUsersFactory } from '../../application/useCases/searchUsers/searchUsersFactory';
import { AuthRequest } from '../interfaces/request';
import { JwtServiceFactory } from '../../../../shared/jwt';

export class AuthController {
  static async login(req: Request, res: Response, next: NextFunction) {
    try {
      const { email, password } = req.body;

      // Create and execute use case
      const loginUseCase = LoginFactory.create();
      const result = await loginUseCase.execute({ email, password });

      // Generate JWT token with a unique identifier for this login session
      const jwtService = JwtServiceFactory.create();
      // Add a unique session ID to differentiate between browser sessions
      const sessionId = Date.now().toString() + Math.random().toString(36).substring(2, 15);
      const tokenPayload = { ...result, sessionId };
      const token = jwtService.generateToken(tokenPayload);

      // Return user info and token
      res.status(200).json({
        success: true,
        message: 'Login successful',
        user: result,
        token: token,
      });
      return;
    } catch (error) {
      res.status(401).json({
        success: false,
        message: error.message,
      });
      console.error('Login error:', error);
      next(error);
      return;
    }
  }

  static async signup(req: Request, res: Response, next: NextFunction) {
    try {
      const { firstName, lastName, email, password, teamId } = req.body;

      // Create and execute use case
      const signupUseCase = SignupFactory.create();
      const result = await signupUseCase.execute({ firstName, lastName, email, password, teamId });

      // Check if user already exists
      if (result.userExists) {
        return res.status(200).json({
          success: true,
          message: 'User with this email already exists',
          data: { ...result },
        });
      }

      // Return success response for new user
      res.status(200).json({
        success: true,
        message: 'Signup successful',
        data: { email: result.email, password: result.password },
      });
      return;
    } catch (error) {
      res.status(200).json({
        success: false,
        message: error.message,
      });
      console.error('Signup error:', error);
      next(error);
      return;
    }
  }

  static async logout(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      // Get user ID from JWT token
      const userId = req.user?.id;

      if (!userId) {
        return res.status(401).json({
          success: false,
          message: 'Not logged in',
        });
      }

      // Create and execute use case
      const logoutUseCase = LogoutFactory.create();
      await logoutUseCase.execute({ userId });

      // The client is responsible for deleting the token
      // We don't need to track tokens server-side since we're fully stateless with JWT

      return res.status(200).json({
        success: true,
        message: 'Logout successful',
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: error.message,
      });
      console.error('Logout error:', error);
      next(error);
      return;
    }
  }

  static async searchUsers(req: Request, res: Response, next: NextFunction) {
    try {
      const searchText = req.query.searchText as string;

      // Create and execute use case
      const searchUsersUseCase = SearchUsersFactory.create();
      const result = await searchUsersUseCase.execute({ searchText });

      // Handle when no users found
      if (!result.found) {
        return res.status(200).json({
          success: true,
          message: 'No users found matching the search criteria',
          data: {
            users: [],
            count: 0,
          },
        });
      }

      // Return search results
      res.status(200).json({
        success: true,
        message: `Found ${result.count} user(s) matching the search criteria`,
        data: result,
      });
      return;
    } catch (error) {
      res.status(200).json({
        success: false,
        message: error.message,
      });
      console.error('Search users error:', error);
      next(error);
      return;
    }
  }

  static async verifyToken(req: Request, res: Response, next: NextFunction) {
    try {
      const authHeader = req.headers.authorization;
      const jwtService = JwtServiceFactory.create();

      // Extract token from header
      const token = jwtService.extractTokenFromHeader(authHeader);

      if (!token) {
        return res.status(401).json({
          success: false,
          message: 'Authentication token is missing',
        });
      }

      // Verify token
      const userData = jwtService.verifyToken(token);

      if (!userData) {
        return res.status(401).json({
          success: false,
          message: 'Invalid or expired authentication token',
        });
      }

      // Return user data
      return res.status(200).json({
        success: true,
        message: 'Token is valid',
        user: userData,
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: error.message,
      });
      console.error('Token verification error:', error);
      next(error);
      return;
    }
  }
}
