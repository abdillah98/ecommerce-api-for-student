import {
  sqliteTable,
  integer,
  text
} from "drizzle-orm/sqlite-core";

import { projects } from "./projects.js";

export const paymentMethods = sqliteTable("payment_methods", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  projectId: integer("project_id")
    .notNull()
    .references(() => projects.id),
  name: text("name").notNull(),
  type: text("type").notNull(), // wallet, bank
  logoUrl: text("logo_url"),
  createdAt: text("created_at").default("CURRENT_TIMESTAMP")
});
