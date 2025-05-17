import { Request, Response, NextFunction } from 'express';
import { CreateTeamFactory } from '../../application/useCases/createTeam/createTeamFactory';
import { GetTeamsFactory } from '../../application/useCases/getTeams/getTeamsFactory';
import { UpdateTeamFactory } from '../../application/useCases/updateTeam/updateTeamFactory';
import { GetTeamByIdFactory } from '../../application/useCases/getTeamById/getTeamByIdFactory';
import { DeleteTeamFactory } from '../../application/useCases/deleteTeam/deleteTeamFactory';

export class TeamController {
  static async createTeam(req: Request, res: Response, next: NextFunction) {
    try {
      const { name } = req.body;

      // Create and execute use case
      const createTeamUseCase = CreateTeamFactory.create();
      const team = await createTeamUseCase.execute({ name });

      res.status(201).json({
        success: true,
        message: 'Team created successfully',
        data: team,
      });
      return;
    } catch (error) {
      res.status(200).json({
        success: false,
        message: error.message,
      });
      console.error('Create team error:', error);
      next(error);
      return;
    }
  }

  static async getAllTeams(_req: Request, res: Response, next: NextFunction) {
    try {
      // Create and execute use case
      const getTeamsUseCase = GetTeamsFactory.create();
      const result = await getTeamsUseCase.execute();

      res.status(200).json({
        success: true,
        message: 'Teams retrieved successfully',
        data: result.teams,
      });
      return;
    } catch (error) {
      res.status(200).json({
        success: false,
        message: error.message,
      });
      console.error('Get teams error:', error);
      next(error);
      return;
    }
  }

  static async getTeamById(req: Request, res: Response, next: NextFunction) {
    try {
      const id = Number(req.params.id);

      if (isNaN(id)) {
        return res.status(400).json({
          success: false,
          message: 'Invalid team ID',
        });
      }

      // Create and execute use case
      const getTeamByIdUseCase = GetTeamByIdFactory.create();
      const team = await getTeamByIdUseCase.execute({ id });

      if (!team) {
        return res.status(404).json({
          success: false,
          message: 'Team not found',
        });
      }

      res.status(200).json({
        success: true,
        message: 'Team retrieved successfully',
        data: team,
      });
      return;
    } catch (error) {
      res.status(200).json({
        success: false,
        message: error.message,
      });
      console.error('Get team by ID error:', error);
      next(error);
      return;
    }
  }

  static async updateTeam(req: Request, res: Response, next: NextFunction) {
    try {
      const id = Number(req.params.id);
      const { name } = req.body;

      if (isNaN(id)) {
        return res.status(400).json({
          success: false,
          message: 'Invalid team ID',
        });
      }

      // Create and execute use case
      const updateTeamUseCase = UpdateTeamFactory.create();
      const team = await updateTeamUseCase.execute({ id, name });

      res.status(200).json({
        success: true,
        message: 'Team updated successfully',
        data: team,
      });
      return;
    } catch (error) {
      res.status(200).json({
        success: false,
        message: error.message,
      });
      console.error('Update team error:', error);
      next(error);
      return;
    }
  }

  static async deleteTeam(req: Request, res: Response, next: NextFunction) {
    try {
      const id = Number(req.params.id);

      if (isNaN(id)) {
        return res.status(400).json({
          success: false,
          message: 'Invalid team ID',
        });
      }

      // Create and execute use case
      const deleteTeamUseCase = DeleteTeamFactory.create();
      const result = await deleteTeamUseCase.execute({ id });

      if (result.success) {
        return res.status(200).json({
          success: true,
          message: result.message,
        });
      } else {
        return res.status(500).json({
          success: false,
          message: result.message,
        });
      }
    } catch (error) {
      res.status(200).json({
        success: false,
        message: error.message,
      });
      console.error('Delete team error:', error);
      next(error);
      return;
    }
  }
}
