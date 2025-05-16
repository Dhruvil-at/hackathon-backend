import Joi from 'joi';

const studentValidation = {
  getStudentDetails: Joi.object({
    studentId: Joi.string().required(),
  }),
};

export default studentValidation;
