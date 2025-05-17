import Joi from 'joi';

const kudosValidation = {
  createKudos: Joi.object({
    recipientId: Joi.string().required().min(1).max(255),
    categoryId: Joi.number().required().positive().integer(),
    teamId: Joi.number().required().positive().integer(),
    message: Joi.string().required().min(5).max(1000),
  }),

  getKudosById: Joi.object({
    id: Joi.string().required(),
  }),

  listKudos: Joi.object({
    recipientId: Joi.string().optional(),
    teamId: Joi.number().optional().positive().integer(),
    categoryId: Joi.number().optional().positive().integer(),
    page: Joi.number().optional().positive().integer().default(1),
    limit: Joi.number().optional().positive().integer().default(10),
    sortOrder: Joi.string().optional().valid('asc', 'desc'),
  }),

  searchKudos: Joi.object({
    query: Joi.string().required().min(1),
    teamId: Joi.number().optional().positive().integer(),
    categoryId: Joi.number().optional().positive().integer(),
    page: Joi.number().optional().positive().integer().default(1),
    limit: Joi.number().optional().positive().integer().default(10),
  }),
};

export default kudosValidation;
