import { Router } from 'express';
import { createValidator } from 'express-joi-validation';
import authValidation from '../validation/auth.validation';
import { AuthController } from '../controllers/authController';
import { isAlreadyLoggedInMiddleware } from '../middleware/isAlreadyLoggedInMiddleware';

const router = Router();
// Set passError to true to ensure validation errors are passed to the error handler
const validator = createValidator({ passError: true });

// Login route
router.post(
  '/login',
  isAlreadyLoggedInMiddleware,
  validator.body(authValidation.login),
  AuthController.login.bind(AuthController),
);

// Signup route
router.post(
  '/signup',
  validator.body(authValidation.signup),
  AuthController.signup.bind(AuthController),
);

// Logout route
router.post('/logout', AuthController.logout.bind(AuthController));

export { router };
