import { mysqlTable, serial, varchar, int, decimal, text, bigint, timestamp } from 'drizzle-orm/mysql-core';

import { projects } from "./projects.js";
import { categories } from "./categories.js";

export const products = mysqlTable("products", {
  id: serial("id").primaryKey(),
  projectId: bigint("project_id", { mode: 'number', unsigned: true }).notNull().references(() => projects.id),
  categoryId: bigint("category_id", { mode: 'number', unsigned: true }).references(() => categories.id),
  productName: varchar("product_name", { length: 100 }).notNull(),
  productDescription: text("product_description"),
  productPrice: decimal("product_price", { precision: 10, scale: 2, mode: 'number' }).notNull(),
  productStock: int("product_stock").default(0),
  productImage: text("product_image"),
  createdAt: timestamp("created_at").defaultNow()
});