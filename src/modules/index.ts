import { Router } from 'express';
import { router as studentRouter } from './student/presentation/routes/student.routes';

const router = Router({ mergeParams: true });

// Mount module routes
router.use('/students', studentRouter);

export default router;
