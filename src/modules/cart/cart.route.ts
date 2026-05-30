import { Router } from "express";
import {
  addToCartController,
  getCartController,
  updateCartItemController,
  deleteCartItemController,
  clearCartController
} from "./cart.controller.js";
import { authMiddleware } from "../../middleware/auth.middleware.js";

const router = Router();
router.use(authMiddleware);

router.post("/", addToCartController);
router.get("/", getCartController);
router.delete("/", clearCartController);
router.put("/:id", updateCartItemController);
router.delete("/:id", deleteCartItemController);

export default router;
