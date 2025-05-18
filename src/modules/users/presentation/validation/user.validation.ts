import Joi from 'joi';
import { UserRole } from '../../domain/interfaces/userRoles';

// Validation schema for updating user role
const updateRole = Joi.object({
  userId: Joi.number().required(),
  teamId: Joi.number().when('role', {
    is: Joi.exist(),
    then: Joi.optional(),
    otherwise: Joi.required(),
  }),
  role: Joi.string().valid(...Object.values(UserRole)),
});

// Validation schema for deleting a user
const deleteUser = Joi.object({
  userId: Joi.number().required(),
});

export default {
  updateRole,
  deleteUser,
};
