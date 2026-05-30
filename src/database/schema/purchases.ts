import {
  sqliteTable,
  integer,
  text,
  real
} from "drizzle-orm/sqlite-core";

import { projects } from "./projects.js";
import { users } from "./users.js";

export const purchases = sqliteTable("purchases", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  projectId: integer("project_id").notNull().references(() => projects.id),
  userId: integer("user_id").notNull().references(() => users.id),
  totalPrice: real("total_price").notNull(),
  status: text("status").default("pending"),
  createdAt: text("created_at").default("CURRENT_TIMESTAMP")
});