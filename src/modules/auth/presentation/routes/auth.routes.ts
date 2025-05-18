import { Router } from 'express';
import { createValidator } from 'express-joi-validation';
import authValidation from '../validation/auth.validation';
import { AuthController } from '../controllers/authController';
import { checkAlreadyLoggedInMiddleware } from '../middleware/checkAlreadyLoggedInMiddleware';
import { adminTechLeadMiddleware } from '../../../../shared/middleware/adminTechLeadMiddleware';
import { jwtAuthMiddleware } from '../../../../shared/middleware/jwtAuthMiddleware';

const router = Router();
// Set passError to true to ensure validation errors are passed to the error handler
const validator = createValidator({ passError: true });

// Login route
router.post(
  '/login',
  checkAlreadyLoggedInMiddleware,
  validator.body(authValidation.login),
  AuthController.login.bind(AuthController),
);

// Signup route
router.post(
  '/signup',
  validator.body(authValidation.signup),
  AuthController.signup.bind(AuthController),
);

// Logout route - protected by JWT authentication
router.post('/logout', jwtAuthMiddleware, AuthController.logout.bind(AuthController));

// Token verification route
router.get('/verify-token', AuthController.verifyToken.bind(AuthController));

// Search users route (accessible to ADMIN and TECH_LEAD only)
router.get(
  '/users/search',
  jwtAuthMiddleware, // First authenticate user with JWT
  adminTechLeadMiddleware, // Then check if user has admin/tech lead role
  validator.query(authValidation.searchUsers),
  AuthController.searchUsers.bind(AuthController),
);

export { router };
