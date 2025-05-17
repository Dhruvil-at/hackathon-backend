import { Router } from 'express';
import { createValidator } from 'express-joi-validation';
import authValidation from '../validation/auth.validation';
import { AuthController } from '../controllers/authController';
import { isAlreadyLoggedInMiddleware } from '../middleware/isAlreadyLoggedInMiddleware';

const router = Router();
const validator = createValidator({ passError: true });

// Login route
router.post(
  '/login',
  isAlreadyLoggedInMiddleware,
  validator.body(authValidation.login),
  AuthController.login.bind(AuthController),
);

// Logout route
router.post('/logout', AuthController.logout.bind(AuthController));

export { router };
