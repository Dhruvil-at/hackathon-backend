import { Router } from 'express';
import { createValidator } from 'express-joi-validation';
import { AnalyticsController } from '../controllers/analyticsController';
import analyticsValidation from '../validation/analytics.validation';

const router = Router();
const validator = createValidator({ passError: true });

// Get analytics data route - protected by authentication
router.get(
  '/',
  validator.query(analyticsValidation.getAnalytics),
  AnalyticsController.getAnalytics.bind(AnalyticsController),
);

export { router };
