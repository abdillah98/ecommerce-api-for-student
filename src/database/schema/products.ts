import {
  sqliteTable,
  integer,
  text,
  real
} from "drizzle-orm/sqlite-core";

import { projects } from "./projects.js";
import { categories } from "./categories.js";

export const products = sqliteTable("products", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  projectId: integer("project_id").notNull().references(() => projects.id),
  categoryId: integer("category_id").references(() => categories.id),
  productName: text("product_name").notNull(),
  productDescription: text("product_description"),
  productPrice: real("product_price").notNull(),
  productStock: integer("product_stock").default(0),
  productImage: text("product_image"),
  createdAt: text("created_at").default("CURRENT_TIMESTAMP")
});