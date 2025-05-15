import { Request, Response } from 'express';
import { GetStudentDetailsFactory } from '../../application/useCases/getStudentDetails/getStudentDetailsFactory';

export class StudentController {
  public async getStudentDetails(req: Request, res: Response): Promise<void> {
    try {
      const studentId = req.query.studentId as string;

      if (!studentId) {
        res.status(400).json({
          status: 'error',
          message: 'Student ID is required',
        });
        return;
      }

      const useCase = GetStudentDetailsFactory.create();
      const result = await useCase.execute({ studentId });

      if (!result) {
        res.status(404).json({
          status: 'error',
          message: `Student with ID ${studentId} not found`,
        });
        return;
      }

      res.status(200).json({
        status: 'success',
        data: result,
      });
    } catch (error) {
      console.error('Error fetching student details:', error);
      res.status(500).json({
        status: 'error',
        message: 'An error occurred while fetching student details',
      });
    }
  }
}
