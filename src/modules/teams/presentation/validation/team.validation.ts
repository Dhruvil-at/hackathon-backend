import * as Joi from 'joi';

const teamValidation = {
  create: Joi.object({
    name: Joi.string().required().min(1).max(100),
  }),

  update: Joi.object({
    name: Joi.string().required().min(1).max(100),
  }),

  // For validating ID parameter in routes
  idParam: Joi.object({
    id: Joi.number().integer().positive().required(),
  }),
};

export default teamValidation;
