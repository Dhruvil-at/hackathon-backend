import { Router } from 'express';
import { UserController } from '../controllers/userController';
import { jwtAuthMiddleware } from '../../../../shared/middleware/jwtAuthMiddleware';
import { createValidator } from 'express-joi-validation';
import userValidation from '../validation/user.validation';
import { AuthMiddleware } from 'src/shared/middleware/authMiddleware';

const router = Router();
const validator = createValidator({ passError: true });

// GET all users - restricted to admin and tech lead roles
router.get(
  '/',
  jwtAuthMiddleware,
  AuthMiddleware.isAdmin,
  UserController.getAllUsers.bind(UserController),
);

// PUT update user role - restricted to admin only
router.put(
  '/:id/role',
  jwtAuthMiddleware,
  AuthMiddleware.isAdmin,
  validator.body(userValidation.updateRole),
  UserController.updateUserRole.bind(UserController),
);

export { router };
