import { Student } from '../domain/entities/student';
import { GetStudentDetailsResponseDto } from '../application/useCases/getStudentDetails/getStudentDetailsResponseDto';

export class StudentMapper {
  static toDto(student: Student): GetStudentDetailsResponseDto {
    return {
      id: student.getId(),
      name: student.getName(),
      age: student.getAge(),
      grade: student.getGrade(),
      marks: student.getMarks(),
      averageScore: student.getAverageScore(),
      isPassing: student.isPassing(),
    };
  }
}
