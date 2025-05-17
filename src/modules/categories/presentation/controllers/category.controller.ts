import { Request, Response, NextFunction } from 'express';
import { CreateCategoryFactory } from '../../application/useCases/createCategory/createCategoryFactory';
import { GetCategoriesFactory } from '../../application/useCases/getCategories/getCategoriesFactory';
import { UpdateCategoryFactory } from '../../application/useCases/updateCategory/updateCategoryFactory';
import { GetCategoryByIdFactory } from '../../application/useCases/getCategoryById/getCategoryByIdFactory';
import { DeleteCategoryFactory } from '../../application/useCases/deleteCategory/deleteCategoryFactory';

export class CategoryController {
  static async createCategory(req: Request, res: Response, next: NextFunction) {
    try {
      const { name } = req.body;

      // Create and execute use case
      const createCategoryUseCase = CreateCategoryFactory.create();
      await createCategoryUseCase.execute({ name });

      res.status(201).json({
        success: true,
      });
      return;
    } catch (error) {
      res.status(500).json({
        success: false,
        message: error.message,
      });
      console.error('Create category error:', error);
      next(error);
      return;
    }
  }

  static async getAllCategories(_req: Request, res: Response, next: NextFunction) {
    try {
      // Create and execute use case
      const getCategoriesUseCase = GetCategoriesFactory.create();
      const result = await getCategoriesUseCase.execute();

      res.status(200).json({
        success: true,
        message: 'Categories retrieved successfully',
        data: result.categories,
      });
      return;
    } catch (error) {
      res.status(200).json({
        success: false,
        message: error.message,
      });
      console.error('Get categories error:', error);
      next(error);
      return;
    }
  }

  static async getCategoryById(req: Request, res: Response, next: NextFunction) {
    try {
      const id = Number(req.params.id);

      if (isNaN(id)) {
        return res.status(400).json({
          success: false,
          message: 'Invalid category ID',
        });
      }

      // Create and execute use case
      const getCategoryByIdUseCase = GetCategoryByIdFactory.create();
      const category = await getCategoryByIdUseCase.execute({ id });

      if (!category) {
        return res.status(404).json({
          success: false,
          message: 'Category not found',
        });
      }

      res.status(200).json({
        success: true,
        message: 'Category retrieved successfully',
        data: category,
      });
      return;
    } catch (error) {
      res.status(200).json({
        success: false,
        message: error.message,
      });
      console.error('Get category by ID error:', error);
      next(error);
      return;
    }
  }

  static async updateCategory(req: Request, res: Response, next: NextFunction) {
    try {
      const id = Number(req.params.id);
      const { name } = req.body;

      if (isNaN(id)) {
        return res.status(400).json({
          success: false,
          message: 'Invalid category ID',
        });
      }

      // Create and execute use case
      const updateCategoryUseCase = UpdateCategoryFactory.create();
      await updateCategoryUseCase.execute({ id, name });

      res.status(200).json({
        success: true,
      });
      return;
    } catch (error) {
      res.status(500).json({
        success: false,
        message: error.message,
      });
      console.error('Update category error:', error);
      next(error);
      return;
    }
  }

  static async deleteCategory(req: Request, res: Response, next: NextFunction) {
    try {
      const id = Number(req.params.id);

      if (isNaN(id)) {
        return res.status(400).json({
          success: false,
          message: 'Invalid category ID',
        });
      }

      // Create and execute use case
      const deleteCategoryUseCase = DeleteCategoryFactory.create();
      const result = await deleteCategoryUseCase.execute({ id });

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
      console.error('Delete category error:', error);
      next(error);
      return;
    }
  }
}
