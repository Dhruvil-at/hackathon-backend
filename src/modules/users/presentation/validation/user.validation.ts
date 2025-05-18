import Joi from 'joi';
import { UserRole } from '../../domain/interfaces/userRoles';

// Validation schema for updating user role
const updateRole = Joi.object({
  userId: Joi.number().required(),
  role: Joi.string()
    .valid(...Object.values(UserRole))
    .required()
    .messages({
      'any.only': `Role must be one of: ${Object.values(UserRole).join(', ')}`,
      'any.required': 'Role is required',
    }),
});

export default {
  updateRole,
};
