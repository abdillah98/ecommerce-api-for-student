import type { Request, Response } from "express";
import {
  createPaymentMethod,
  getPaymentMethods,
  getPaymentMethodById,
  updatePaymentMethod,
  deletePaymentMethod
} from "./payment-method.service.js";
import { successResponse } from "../../utils/response.js";
import { asyncHandler } from "../../utils/async-handler.js";
import { AppError } from "../../utils/app-error.js";

export const createPaymentMethodController = asyncHandler(async (
  req: Request,
  res: Response
) => {
  const method = await createPaymentMethod(
    req.user!.projectId,
    req.body
  );

  return successResponse(
    res,
    "Payment method created successfully",
    method,
    201
  );
});

export const getPaymentMethodsController = asyncHandler(async (
  req: Request,
  res: Response
) => {
  const data = await getPaymentMethods(
    req.user!.projectId
  );

  return successResponse(
    res,
    "Payment methods fetched successfully",
    data
  );
});

export const getPaymentMethodByIdController = asyncHandler(async (
  req: Request,
  res: Response
) => {
  const method = await getPaymentMethodById(
    req.user!.projectId,
    Number(req.params.id)
  );

  if (!method) {
    throw new AppError("Payment method not found", 404);
  }

  return successResponse(
    res,
    "Payment method fetched successfully",
    method
  );
});

export const updatePaymentMethodController = asyncHandler(async (
  req: Request,
  res: Response
) => {
  const method = await updatePaymentMethod(
    req.user!.projectId,
    Number(req.params.id),
    req.body
  );

  return successResponse(
    res,
    "Payment method updated successfully",
    method
  );
});

export const deletePaymentMethodController = asyncHandler(async (
  req: Request,
  res: Response
) => {
  const method = await deletePaymentMethod(
    req.user!.projectId,
    Number(req.params.id)
  );

  return successResponse(
    res,
    "Payment method deleted successfully",
    method
  );
});
