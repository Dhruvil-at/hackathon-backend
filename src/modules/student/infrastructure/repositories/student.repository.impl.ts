import { Student } from '../../domain/entities/student';
import { StudentRepository } from '../../repositories/student.repository';

export class StudentRepositoryImpl implements StudentRepository {
  private mockStudents: Student[] = [
    Student.create({
      id: '1',
      name: 'John Doe',
      age: 16,
      grade: '10th',
      marks: [
        { subject: 'Math', score: 85 },
        { subject: 'Science', score: 92 },
        { subject: 'English', score: 78 },
        { subject: 'History', score: 65 },
      ],
    }),
    Student.create({
      id: '2',
      name: 'Jane Smith',
      age: 17,
      grade: '11th',
      marks: [
        { subject: 'Math', score: 92 },
        { subject: 'Science', score: 88 },
        { subject: 'English', score: 95 },
        { subject: 'History', score: 76 },
      ],
    }),
    Student.create({
      id: '3',
      name: 'Bob Johnson',
      age: 15,
      grade: '9th',
      marks: [
        { subject: 'Math', score: 65 },
        { subject: 'Science', score: 72 },
        { subject: 'English', score: 58 },
        { subject: 'History', score: 45 },
      ],
    }),
    Student.create({
      id: '4',
      name: 'Emily Davis',
      age: 16,
      grade: '10th',
      marks: [
        { subject: 'Math', score: 98 },
        { subject: 'Science', score: 94 },
        { subject: 'English', score: 91 },
        { subject: 'History', score: 89 },
      ],
    }),
    Student.create({
      id: '5',
      name: 'Michael Wilson',
      age: 17,
      grade: '11th',
      marks: [
        { subject: 'Math', score: 72 },
        { subject: 'Science', score: 68 },
        { subject: 'English', score: 75 },
        { subject: 'History', score: 65 },
      ],
    }),
  ];

  async findById(id: string): Promise<Student | null> {
    const student = this.mockStudents.find((student) => student.getId() === id);
    return student || null;
  }

  async findAll(): Promise<Student[]> {
    return [...this.mockStudents];
  }
}
