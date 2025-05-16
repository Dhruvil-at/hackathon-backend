import { StudentRepositoryImpl } from '../../../infrastructure/repositories/student.repository.impl';
import { GetStudentDetailsUseCase } from './getStudentDetails';

export class GetStudentDetailsFactory {
  static create(): GetStudentDetailsUseCase {
    const studentRepository = new StudentRepositoryImpl();
    return new GetStudentDetailsUseCase(studentRepository);
  }
}
