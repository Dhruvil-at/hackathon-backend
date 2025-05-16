import { StudentRepository } from '../../../repositories/student.repository';
import { GetStudentDetailsRequestDto } from './getStudentDetailsRequestDto';
import { GetStudentDetailsResponseDto } from './getStudentDetailsResponseDto';
import { StudentMapper } from '../../../mappers/student.mapper';

export class GetStudentDetailsUseCase {
  constructor(private studentRepository: StudentRepository) {}

  async execute(
    request: GetStudentDetailsRequestDto,
  ): Promise<GetStudentDetailsResponseDto | null> {
    const student = await this.studentRepository.findById(request.studentId);

    if (!student) {
      return null;
    }

    return StudentMapper.toDto(student);
  }
}
