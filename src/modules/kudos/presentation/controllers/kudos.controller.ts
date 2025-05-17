import { Request, Response, NextFunction } from 'express';
import { CreateKudosFactory } from '../../application/useCases/createKudos/createKudosFactory';
import { GetKudosByIdFactory } from '../../application/useCases/getKudosById/getKudosByIdFactory';
import { ListKudosFactory } from '../../application/useCases/listKudos/listKudosFactory';
import { SearchKudosFactory } from '../../application/useCases/searchKudos/searchKudosFactory';
import { AuthRequest } from 'src/modules/auth/presentation/interfaces/request';

export class KudosController {
  static async createKudos(req: Request, res: Response, next: NextFunction) {
    try {
      const authReq = req as AuthRequest;

      const { useCase } = CreateKudosFactory.create();
      const user = authReq.session.user as { id: number };

      await useCase.execute(req.body, user.id);

      res.status(201).json({
        success: true,
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: error.message,
      });
      next(error);
    }
  }

  static async getKudosById(req: Request, res: Response, next: NextFunction) {
    try {
      const { useCase } = GetKudosByIdFactory.create();

      const result = await useCase.execute({
        id: req.params.id,
      });

      res.status(200).json({
        success: true,
        data: result,
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: error.message,
      });
      next(error);
    }
  }

  static async listKudos(req: Request, res: Response, next: NextFunction) {
    try {
      const { useCase } = ListKudosFactory.create();

      const dto = {
        recipientId: req.query.recipientId as string | undefined,
        teamId: req.query.teamId ? parseInt(req.query.teamId as string) : undefined,
        categoryId: req.query.categoryId ? parseInt(req.query.categoryId as string) : undefined,
        page: req.query.page ? parseInt(req.query.page as string) : undefined,
        limit: req.query.limit ? parseInt(req.query.limit as string) : undefined,
      };
      const result = await useCase.execute(dto);

      res.status(200).json({
        success: true,
        data: result,
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: error.message,
      });
      next(error);
    }
  }

  static async searchKudos(req: Request, res: Response, next: NextFunction) {
    try {
      const { useCase } = SearchKudosFactory.create();

      const result = await useCase.execute({
        query: req.query.query as string,
        teamId: req.query.teamId ? parseInt(req.query.teamId as string) : undefined,
        categoryId: req.query.categoryId ? parseInt(req.query.categoryId as string) : undefined,
        page: req.query.page ? parseInt(req.query.page as string) : undefined,
        limit: req.query.limit ? parseInt(req.query.limit as string) : undefined,
      });

      res.status(200).json({
        success: true,
        data: result,
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: error.message,
      });
      next(error);
    }
  }
}
