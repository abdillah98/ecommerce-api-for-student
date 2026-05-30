import {
  sqliteTable,
  integer,
  text
} from "drizzle-orm/sqlite-core";

import { projects } from "./projects.js";

export const users = sqliteTable("users", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  projectId: integer("project_id")
    .notNull()
    .references(() => projects.id),
  name: text("name").notNull(),
  email: text("email").notNull().unique(),
  password: text("password").notNull(),
  role: text("role").default("customer"),
  createdAt: text("created_at").default("CURRENT_TIMESTAMP")
});