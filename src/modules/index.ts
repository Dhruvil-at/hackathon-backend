import { Router } from 'express';
import { router as studentRouter } from './student/presentation/routes/student.routes';
import { router as authRouter } from './auth/presentation/routes/auth.routes';
import { router as kudosRouter } from './kudos/presentation/routes/kudos.routes';
import { router as teamRouter } from './teams/presentation/routes/team.routes';

const router = Router({ mergeParams: true });

// Mount module routes
router.use('/students', studentRouter);
router.use('/auth', authRouter);
router.use('/kudos', kudosRouter);
router.use('/teams', teamRouter);

export default router;
