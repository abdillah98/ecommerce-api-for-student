import {
  sqliteTable,
  integer,
  text
} from "drizzle-orm/sqlite-core";

import { projects } from "./projects.js";
import { users } from "./users.js";
import { products } from "./products.js";

export const carts = sqliteTable("carts", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  projectId: integer("project_id").notNull().references(() => projects.id),
  userId: integer("user_id").notNull().references(() => users.id),
  productId: integer("product_id").notNull().references(() => products.id),
  quantity: integer("quantity").default(1),
  createdAt: text("created_at").default("CURRENT_TIMESTAMP")
});