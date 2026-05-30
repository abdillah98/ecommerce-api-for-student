import {
  sqliteTable,
  integer,
  text
} from "drizzle-orm/sqlite-core";

import { projects } from "./projects.js";

export const categories = sqliteTable("categories", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  projectId: integer("project_id")
    .notNull()
    .references(() => projects.id),
  categoryName: text("category_name").notNull(),
  createdAt: text("created_at").default("CURRENT_TIMESTAMP")
});