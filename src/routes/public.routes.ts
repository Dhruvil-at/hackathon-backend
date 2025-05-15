import { Router } from 'express';
import { HealthCheckController } from '../modules/health-check/health-check.controller';

const router = Router();
const healthCheckController = new HealthCheckController();

// Health check route
router.get('/health', healthCheckController.publicHealthCheck);

export default router;
