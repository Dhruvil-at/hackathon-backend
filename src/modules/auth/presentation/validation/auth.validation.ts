import * as Joi from 'joi';

const authValidation = {
  login: Joi.object({
    email: Joi.string().email().required(),
    password: Joi.string().required(),
  }),

  logout: Joi.object({
    // No validation needed for logout as it uses session data
  }),
};

export default authValidation;
