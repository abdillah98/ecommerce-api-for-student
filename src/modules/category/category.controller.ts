import type { Request, Response } from "express";
import {
  createCategory,
  getCategories,
  getCategoryById,
  updateCategory,
  deleteCategory
} from "./category.service.js";
import { successResponse } from "../../utils/response.js";
import { asyncHandler } from "../../utils/async-handler.js";
import { AppError } from "../../utils/app-error.js";

export const createCategoryController =
  asyncHandler(async (
    req: Request,
    res: Response
  ) => {

    const category =
      await createCategory(
        req.user!.projectId,
        req.body
      );

    return successResponse(
      res,
      "Category created successfully",
      category,
      201
    );
  });

export const getCategoriesController =
  asyncHandler(async (
    req: Request,
    res: Response
  ) => {

    const data =
      await getCategories(
        req.user!.projectId
      );

    return successResponse(
      res,
      "Categories fetched successfully",
      data
    );
  });

export const getCategoryByIdController =
  asyncHandler(async (
    req: Request,
    res: Response
  ) => {

    const category =
      await getCategoryById(
        req.user!.projectId,
        Number(req.params.id)
      );

    if (!category) {

      throw new AppError(
        "Category not found",
        404
      );
    }

    return successResponse(
      res,
      "Category fetched successfully",
      category
    );
  });

export const updateCategoryController =
  asyncHandler(async (
    req: Request,
    res: Response
  ) => {

    const category =
      await updateCategory(
        req.user!.projectId,
        Number(req.params.id),
        req.body
      );

    return successResponse(
      res,
      "Category updated successfully",
      category
    );
  });

export const deleteCategoryController =
  asyncHandler(async (
    req: Request,
    res: Response
  ) => {

    const category =
      await deleteCategory(
        req.user!.projectId,
        Number(req.params.id)
      );

    return successResponse(
      res,
      "Category deleted successfully",
      category
    );
  });