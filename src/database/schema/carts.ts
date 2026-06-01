
import { mysqlTable, serial, int, timestamp, bigint } from 'drizzle-orm/mysql-core';

import { projects } from "./projects.js";
import { users } from "./users.js";
import { products } from "./products.js";

export const carts = mysqlTable("carts", {
  id: serial("id").primaryKey(),
  projectId: bigint("project_id", { mode: 'number' }).notNull().references(() => projects.id),
  userId: bigint("user_id", { mode: 'number' }).notNull().references(() => users.id),
  productId: bigint("product_id", { mode: 'number' }).notNull().references(() => products.id),
  quantity: int("quantity").default(1),
  createdAt: timestamp("created_at").defaultNow()
});