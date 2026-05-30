import {
  sqliteTable,
  integer,
  text
} from "drizzle-orm/sqlite-core";

export const projects = sqliteTable("projects", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  projectTitle: text("project_title").notNull(),
  projectDescription: text("project_description"),
  projectClass: text("project_class").notNull(),
  projectTeam: text("project_team").notNull(),
  createdAt: text("created_at")
    .default("CURRENT_TIMESTAMP")
});