import { Router } from 'express';
import { createValidator } from 'express-joi-validation';
import kudosValidation from '../validation/kudos.validation';
import { KudosController } from '../controllers/kudos.controller';
import { isTechLead } from '../middleware/role-check.middleware';

const router = Router();
const validator = createValidator({ passError: true });

// GET /api/kudos/search - Search kudos by text
router.get(
  '/search',
  validator.query(kudosValidation.searchKudos),
  KudosController.searchKudos.bind(KudosController),
);

// POST /api/kudos - Create new kudos (tech lead only)
router.post(
  '/',
  isTechLead,
  validator.body(kudosValidation.createKudos),
  KudosController.createKudos.bind(KudosController),
);

// GET /api/kudos/:id - Get specific kudos details
router.get(
  '/:id',
  validator.params(kudosValidation.getKudosById),
  KudosController.getKudosById.bind(KudosController),
);

// GET /api/kudos - List all kudos with filtering options
router.get(
  '/',
  validator.query(kudosValidation.listKudos),
  KudosController.listKudos.bind(KudosController),
);

export { router };
