import { Router } from "express";
import {
  createProductController,
  getProductsController,
  getProductByIdController,
  updateProductController,
  deleteProductController
} from "./product.controller.js";
import { authMiddleware } from "../../middleware/auth.middleware.js";

const router = Router();
router.use(authMiddleware);

router.post("/", createProductController);
router.get("/", getProductsController);
router.get("/:id", getProductByIdController);
router.put("/:id", updateProductController);
router.delete("/:id", deleteProductController);

export default router;
