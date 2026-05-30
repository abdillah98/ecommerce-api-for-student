import type { Request, Response } from "express";

import {
  register,
  login,
  getCurrentUser
} from "./auth.service.js";
import { successResponse } from "../../utils/response.js";
import { asyncHandler } from "../../utils/async-handler.js";

export const registerController =
  asyncHandler(async (
    req: Request,
    res: Response
  ) => {

    const user = await register(req.body);

    return successResponse(
      res,
      "Register success",
      user,
      201
    );
  });

export const loginController =
  asyncHandler(async (
    req: Request,
    res: Response
  ) => {

    const result = await login(req.body);

    return successResponse(
      res,
      "Login success",
      result
    );
  });

export const meController =
  asyncHandler(async (
    req: Request,
    res: Response
  ) => {

    const user =
      await getCurrentUser(
        req.user!.userId
      );

    return successResponse(
      res,
      "Current user fetched",
      user
    );
  });