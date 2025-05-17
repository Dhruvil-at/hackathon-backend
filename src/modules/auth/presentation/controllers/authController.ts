import { Request, Response, NextFunction } from 'express';
import { LoginFactory } from '../../application/useCases/login/loginFactory';
import { LogoutFactory } from '../../application/useCases/logout/logoutFactory';
import { SignupFactory } from '../../application/useCases/signup/signupFactory';
import { AuthRequest } from '../interfaces/request';

export class AuthController {
  static async login(req: Request, res: Response, next: NextFunction) {
    try {
      // Check if user is already logged in
      const authReq = req as AuthRequest;
      if (authReq.session.isAuthenticated && authReq.session.user) {
        return res.status(200).json({
          success: true,
          message: 'User is already logged in',
          data: authReq.session.user,
        });
      }

      const { email, password } = req.body;

      // Create and execute use case
      const loginUseCase = LoginFactory.create();
      const result = await loginUseCase.execute({ email, password });

      // Set session data
      authReq.session.user = result;
      authReq.session.isAuthenticated = true;

      // Return user info
      res.status(200).json({
        success: true,
        message: 'Login successful',
        data: result,
      });
      return;
    } catch (error) {
      res.status(200).json({
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
          data: { email: result.email, userExists: true },
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
      const userId = req.session.user?.id;

      if (!userId) {
        return res.status(400).json({
          success: false,
          message: 'Not logged in',
        });
      }

      // Create and execute use case
      const logoutUseCase = LogoutFactory.create();
      await logoutUseCase.execute({ userId });

      // Destroy session
      req.session.destroy((err: Error) => {
        if (err) {
          console.error('Session destruction error:', err);
          return next(err);
        }

        res.clearCookie('connect.sid');
        return res.status(200).json({
          success: true,
          message: 'Logout successful',
        });
      });
      return;
    } catch (error) {
      res.status(200).json({
        success: false,
        message: error.message,
      });
      console.error('Logout error:', error);
      next(error);
      return;
    }
  }
}
