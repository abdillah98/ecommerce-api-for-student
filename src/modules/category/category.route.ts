import { Router }
  from "express";

import {
  createCategoryController,
  getCategoriesController,
  getCategoryByIdController,
  updateCategoryController,
  deleteCategoryController
} from "./category.controller.js";

import { authMiddleware } from "../../middleware/auth.middleware.js";

const router = Router();
router.use(authMiddleware);

router.post("/", createCategoryController);
router.get("/", getCategoriesController);
router.get("/:id", getCategoryByIdController);
router.put("/:id", updateCategoryController);
router.delete("/:id", deleteCategoryController);
export default router;