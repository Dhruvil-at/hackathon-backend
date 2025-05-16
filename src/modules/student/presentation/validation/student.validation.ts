import Joi from 'joi';

const studentValidation = {
  getStudentDetails: Joi.object({
    studentId: Joi.string().required().trim().messages({
      'string.empty': 'Student ID cannot be empty',
      'any.required': 'Student ID is required',
    }),
  }),
};

export default studentValidation;
