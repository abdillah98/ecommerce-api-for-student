import type { Request, Response } from "express";
import {
  addToCart,
  getCart,
  updateCartItem,
  deleteCartItem,
  clearCart
} from "./cart.service.js";
import { successResponse } from "../../utils/response.js";
import { asyncHandler } from "../../utils/async-handler.js";
import { AppError } from "../../utils/app-error.js";

export const addToCartController = asyncHandler(async (
  req: Request,
  res: Response
) => {
  const cartItem = await addToCart(
    req.user!.projectId,
    req.user!.userId,
    req.body
  );

  return successResponse(
    res,
    "Product added to cart successfully",
    cartItem,
    201
  );
});

export const getCartController = asyncHandler(async (
  req: Request,
  res: Response
) => {
  const data = await getCart(
    req.user!.projectId,
    req.user!.userId
  );

  return successResponse(
    res,
    "Cart fetched successfully",
    data
  );
});

export const updateCartItemController = asyncHandler(async (
  req: Request,
  res: Response
) => {
  const { quantity } = req.body;
  if (quantity === undefined || quantity <= 0) {
    throw new AppError("Quantity must be greater than 0", 400);
  }

  const cartItem = await updateCartItem(
    req.user!.projectId,
    req.user!.userId,
    Number(req.params.id),
    Number(quantity)
  );

  return successResponse(
    res,
    "Cart item updated successfully",
    cartItem
  );
});

export const deleteCartItemController = asyncHandler(async (
  req: Request,
  res: Response
) => {
  const cartItem = await deleteCartItem(
    req.user!.projectId,
    req.user!.userId,
    Number(req.params.id)
  );

  return successResponse(
    res,
    "Cart item deleted successfully",
    cartItem
  );
});

export const clearCartController = asyncHandler(async (
  req: Request,
  res: Response
) => {
  await clearCart(
    req.user!.projectId,
    req.user!.userId
  );

  return successResponse(
    res,
    "Cart cleared successfully"
  );
});
