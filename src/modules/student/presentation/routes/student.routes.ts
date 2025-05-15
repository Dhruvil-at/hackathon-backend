import { Router } from 'express';
import { StudentController } from '../controllers/student.controller';

export class StudentRoutes {
  public static configure(router: Router): void {
    const controller = new StudentController();

    router.get('/students', controller.getStudentDetails);
  }
}
