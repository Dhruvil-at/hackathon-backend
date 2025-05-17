import * as Joi from 'joi';

const authValidation = {
  login: Joi.object({
    email: Joi.string().email().required(),
    password: Joi.string().required(),
  }),

  signup: Joi.object({
    firstName: Joi.string().required(),
    lastName: Joi.string().required(),
    email: Joi.string().email().required(),
    password: Joi.string().required(),
    teamId: Joi.number().required(),
  }),

  searchUsers: Joi.object({
    searchText: Joi.string().required().min(1),
  }),
};

export default authValidation;
