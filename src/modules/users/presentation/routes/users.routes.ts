import { Router } from 'express';
import { UserController } from '../controllers/userController';
import { jwtAuthMiddleware } from '../../../auth/presentation/middleware/jwtAuthMiddleware';
import { adminTechLeadMiddleware } from '../../../auth/presentation/middleware/adminTechLeadMiddleware';
import { createValidator } from 'express-joi-validation';
import userValidation from '../validation/user.validation';

const router = Router();
const validator = createValidator({ passError: true });

// GET all users - restricted to admin and tech lead roles
router.get(
  '/',
  jwtAuthMiddleware,
  adminTechLeadMiddleware,
  UserController.getAllUsers.bind(UserController),
);

// PUT update user role - restricted to admin only
router.put(
  '/:id/role',
  jwtAuthMiddleware,
  adminTechLeadMiddleware,
  validator.body(userValidation.updateRole),
  UserController.updateUserRole.bind(UserController),
);

export { router };
