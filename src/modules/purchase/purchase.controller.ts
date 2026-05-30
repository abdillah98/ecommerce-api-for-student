import type { Request, Response } from "express";
import {
  checkout,
  getPurchases,
  getPurchaseById,
  updatePurchaseStatus
} from "./purchase.service.js";
import { successResponse } from "../../utils/response.js";
import { asyncHandler } from "../../utils/async-handler.js";

export const checkoutController = asyncHandler(async (
  req: Request,
  res: Response
) => {
  const { address, paymentMethodId } = req.body;

  const purchase = await checkout(
    req.user!.projectId,
    req.user!.userId,
    { address, paymentMethodId: Number(paymentMethodId) }
  );

  return successResponse(
    res,
    "Checkout successful and purchase record created",
    purchase,
    201
  );
});

export const getPurchasesController = asyncHandler(async (
  req: Request,
  res: Response
) => {
  const data = await getPurchases(
    req.user!.projectId,
    req.user!.userId
  );

  return successResponse(
    res,
    "Purchases fetched successfully",
    data
  );
});

export const getPurchaseByIdController = asyncHandler(async (
  req: Request,
  res: Response
) => {
  const purchase = await getPurchaseById(
    req.user!.projectId,
    req.user!.userId,
    Number(req.params.id)
  );

  return successResponse(
    res,
    "Purchase details fetched successfully",
    purchase
  );
});

export const updatePurchaseStatusController = asyncHandler(async (
  req: Request,
  res: Response
) => {
  const { status } = req.body;
  if (!status) {
    throw new Error("Status is required");
  }

  const purchase = await updatePurchaseStatus(
    req.user!.projectId,
    req.user!.userId,
    Number(req.params.id),
    status
  );

  return successResponse(
    res,
    "Purchase status updated successfully",
    purchase
  );
});
