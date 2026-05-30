import express from "express";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";

import { errorMiddleware } from "./middleware/error.middleware.js";

import projectRoutes from "./modules/project/project.route.js";
import authRoutes from "./modules/auth/auth.route.js";
import categoryRoutes from "./modules/category/category.route.js";
import productRoutes from "./modules/product/product.route.js";
import cartRoutes from "./modules/cart/cart.route.js";
import purchaseRoutes from "./modules/purchase/purchase.route.js";
import paymentMethodRoutes from "./modules/payment-method/payment-method.route.js";

const app = express();

app.use(cors());
app.use(helmet());
app.use(morgan("dev"));
app.use(express.json());

app.get("/", (req, res) => {
  res.json({
    success: true,
    message: "Ecommerce API Running"
  });
});

app.use("/auth", authRoutes);
app.use("/projects", projectRoutes);
app.use("/categories", categoryRoutes);
app.use("/products", productRoutes);
app.use("/carts", cartRoutes);
app.use("/purchases", purchaseRoutes);
app.use("/payment-methods", paymentMethodRoutes);

app.use(errorMiddleware);

export default app;