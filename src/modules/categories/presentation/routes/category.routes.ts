import { Router } from 'express';
import { createValidator } from 'express-joi-validation';
import { CategoryController } from '../controllers/category.controller';
import categoryValidation from '../validation/category.validation';
import { AuthMiddleware } from '../../../../shared/middleware/authMiddleware';
import { jwtAuthMiddleware } from '../../../../shared/middleware/jwtAuthMiddleware';

const router = Router();
const validator = createValidator({ passError: true });

// Public routes
// Get all categories
router.get('/', CategoryController.getAllCategories.bind(CategoryController));

// Get category by ID
router.get(
  '/:id',
  validator.params(categoryValidation.idParam),
  CategoryController.getCategoryById.bind(CategoryController),
);

// Protected routes - require ADMIN role
// Create category
router.post(
  '/',
  jwtAuthMiddleware,
  AuthMiddleware.isAdmin,
  validator.body(categoryValidation.create),
  CategoryController.createCategory.bind(CategoryController),
);

// Update category
router.put(
  '/:id',
  jwtAuthMiddleware,
  AuthMiddleware.isAdmin,
  validator.params(categoryValidation.idParam),
  validator.body(categoryValidation.update),
  CategoryController.updateCategory.bind(CategoryController),
);

// Delete category
router.delete(
  '/:id',
  jwtAuthMiddleware,
  AuthMiddleware.isAdmin,
  validator.params(categoryValidation.idParam),
  CategoryController.deleteCategory.bind(CategoryController),
);

export { router };
