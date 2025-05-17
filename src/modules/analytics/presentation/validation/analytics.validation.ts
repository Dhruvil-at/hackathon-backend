import * as Joi from 'joi';
import { TimePeriod } from '../../domain/interfaces/analyticsTypes';

const analyticsValidation = {
  getAnalytics: Joi.object({
    period: Joi.string()
      .valid(...Object.values(TimePeriod))
      .default(TimePeriod.ALL_TIME),
    limit: Joi.number().integer().min(1).max(10).default(3),
  }),
};

export default analyticsValidation;
