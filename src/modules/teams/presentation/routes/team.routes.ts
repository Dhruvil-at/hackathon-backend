import { Router } from 'express';
import { createValidator } from 'express-joi-validation';
import { TeamController } from '../controllers/team.controller';
import teamValidation from '../validation/team.validation';
import { AuthMiddleware } from '../../../../shared/middleware/authMiddleware';
import { jwtAuthMiddleware } from 'src/shared/middleware/jwtAuthMiddleware';

const router = Router();
const validator = createValidator({ passError: true });

// Public routes
// Get all teams
router.get('/', TeamController.getAllTeams.bind(TeamController));

// Get team by ID
router.get(
  '/:id',
  validator.params(teamValidation.idParam),
  TeamController.getTeamById.bind(TeamController),
);

// Protected routes - require ADMIN role
// Create team
router.post(
  '/',
  jwtAuthMiddleware,
  AuthMiddleware.isAdmin,
  validator.body(teamValidation.create),
  TeamController.createTeam.bind(TeamController),
);

// Update team
router.put(
  '/:id',
  jwtAuthMiddleware,
  AuthMiddleware.isAdmin,
  validator.params(teamValidation.idParam),
  validator.body(teamValidation.update),
  TeamController.updateTeam.bind(TeamController),
);

// Delete team
router.delete(
  '/:id',
  jwtAuthMiddleware,
  AuthMiddleware.isAdmin,
  validator.params(teamValidation.idParam),
  TeamController.deleteTeam.bind(TeamController),
);

export { router };
