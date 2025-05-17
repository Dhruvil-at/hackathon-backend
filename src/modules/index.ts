import { Router } from 'express';
import { router as authRouter } from './auth/presentation/routes/auth.routes';
import { router as kudosRouter } from './kudos/presentation/routes/kudos.routes';
import { router as teamRouter } from './teams/presentation/routes/team.routes';
import { categoryRoutes } from './categories';
import { router as analyticsRouter } from './analytics/presentation/routes/analytics.routes';

const router = Router({ mergeParams: true });

// Mount module routes
router.use('/auth', authRouter);
router.use('/kudos', kudosRouter);
router.use('/teams', teamRouter);
router.use('/categories', categoryRoutes);
router.use('/analytics', analyticsRouter);

export default router;
