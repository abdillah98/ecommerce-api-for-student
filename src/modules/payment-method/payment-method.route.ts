import { Router } from "express";
import {
  createPaymentMethodController,
  getPaymentMethodsController,
  getPaymentMethodByIdController,
  updatePaymentMethodController,
  deletePaymentMethodController
} from "./payment-method.controller.js";
import { authMiddleware } from "../../middleware/auth.middleware.js";

const router = Router();
router.use(authMiddleware);

router.post("/", createPaymentMethodController);
router.get("/", getPaymentMethodsController);
router.get("/:id", getPaymentMethodByIdController);
router.put("/:id", updatePaymentMethodController);
router.delete("/:id", deletePaymentMethodController);

export default router;
