import type { Request, Response } from "express";
import {
  createProduct,
  getProducts,
  getProductById,
  updateProduct,
  deleteProduct
} from "./product.service.js";
import { successResponse } from "../../utils/response.js";
import { asyncHandler } from "../../utils/async-handler.js";
import { AppError } from "../../utils/app-error.js";

export const createProductController = asyncHandler(async (
  req: Request,
  res: Response
) => {
  const product = await createProduct(
    req.user!.projectId,
    req.body
  );

  return successResponse(
    res,
    "Product created successfully",
    product,
    201
  );
});

export const getProductsController = asyncHandler(async (
  req: Request,
  res: Response
) => {
  const categoryId = req.query.categoryId ? Number(req.query.categoryId) : undefined;
  const data = await getProducts(
    req.user!.projectId,
    categoryId
  );

  return successResponse(
    res,
    "Products fetched successfully",
    data
  );
});

export const getProductByIdController = asyncHandler(async (
  req: Request,
  res: Response
) => {
  const product = await getProductById(
    req.user!.projectId,
    Number(req.params.id)
  );

  if (!product) {
    throw new AppError("Product not found", 404);
  }

  return successResponse(
    res,
    "Product fetched successfully",
    product
  );
});

export const updateProductController = asyncHandler(async (
  req: Request,
  res: Response
) => {
  const product = await updateProduct(
    req.user!.projectId,
    Number(req.params.id),
    req.body
  );

  return successResponse(
    res,
    "Product updated successfully",
    product
  );
});

export const deleteProductController = asyncHandler(async (
  req: Request,
  res: Response
) => {
  const product = await deleteProduct(
    req.user!.projectId,
    Number(req.params.id)
  );

  return successResponse(
    res,
    "Product deleted successfully",
    product
  );
});
