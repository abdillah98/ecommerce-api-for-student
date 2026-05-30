import { Router } from "express";
import {
  checkoutController,
  getPurchasesController,
  getPurchaseByIdController,
  updatePurchaseStatusController
} from "./purchase.controller.js";
import { authMiddleware } from "../../middleware/auth.middleware.js";

const router = Router();
router.use(authMiddleware);

router.post("/", checkoutController);
router.get("/", getPurchasesController);
router.get("/:id", getPurchaseByIdController);
router.put("/:id", updatePurchaseStatusController);

export default router;
