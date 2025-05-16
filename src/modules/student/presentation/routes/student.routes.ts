import { Router } from 'express';
import { createValidator } from 'express-joi-validation';
import studentValidation from '../validation/student.validation';
import { StudentController } from '../controllers/student.controller';

const router = Router();
const validator = createValidator({ passError: true });

router.get(
  '/',
  validator.query(studentValidation.getStudentDetails),
  StudentController.getStudentDetails.bind(StudentController),
);

export { router };
