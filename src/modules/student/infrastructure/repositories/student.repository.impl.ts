import { BaseRepository } from '../../../../infrastructure/database';
import { Student, Mark } from '../../domain/entities/student';
import { StudentRepository } from '../../repositories/student.repository';

interface StudentRow {
  id: string;
  name: string;
  age: number;
  grade: string;
}

interface MarkRow {
  student_id: string;
  subject: string;
  score: number;
}

export class StudentRepositoryImpl extends BaseRepository implements StudentRepository {
  /**
   * Find a student by ID
   */
  async findById(id: string): Promise<Student | null> {
    try {
      // Get student data
      const studentQuery = `
        SELECT id, name, age, grade
        FROM students
        WHERE id = ?
      `;

      const students = await this.executeQuery<StudentRow[]>('student-find-by-id', studentQuery, [
        id,
      ]);

      if (!students || students.length === 0) {
        return null;
      }

      const studentData = students[0];

      // Get student marks
      const marksQuery = `
        SELECT subject, score
        FROM student_marks
        WHERE student_id = ?
      `;

      const marks = await this.executeQuery<MarkRow[]>('student-get-marks', marksQuery, [id]);

      // Map to domain entity
      return Student.create({
        id: studentData.id,
        name: studentData.name,
        age: studentData.age,
        grade: studentData.grade,
        marks: marks.map((m) => ({ subject: m.subject, score: m.score })),
      });
    } catch (error) {
      console.error('Error finding student by ID:', error);
      throw new Error('Failed to find student');
    }
  }

  /**
   * Find all students
   */
  async findAll(): Promise<Student[]> {
    try {
      // Get all students
      const studentsQuery = `
        SELECT id, name, age, grade
        FROM students
      `;

      const students = await this.executeQuery<StudentRow[]>('student-find-all', studentsQuery);

      if (!students || students.length === 0) {
        return [];
      }

      // Get all marks for all students
      const studentIds = students.map((s) => s.id);
      const placeholders = studentIds.map(() => '?').join(',');

      const marksQuery = `
        SELECT student_id, subject, score
        FROM student_marks
        WHERE student_id IN (${placeholders})
      `;

      const allMarks = await this.executeQuery<MarkRow[]>(
        'student-get-all-marks',
        marksQuery,
        studentIds,
      );

      // Group marks by student ID
      const marksByStudentId = allMarks.reduce((acc, mark) => {
        if (!acc[mark.student_id]) {
          acc[mark.student_id] = [];
        }
        acc[mark.student_id].push({
          subject: mark.subject,
          score: mark.score,
        });
        return acc;
      }, {} as Record<string, Mark[]>);

      // Map to domain entities
      return students.map((studentData) => {
        return Student.create({
          id: studentData.id,
          name: studentData.name,
          age: studentData.age,
          grade: studentData.grade,
          marks: marksByStudentId[studentData.id] || [],
        });
      });
    } catch (error) {
      console.error('Error finding all students:', error);
      throw new Error('Failed to find students');
    }
  }
}
