import { mysqlTable, serial, varchar, bigint, timestamp } from 'drizzle-orm/mysql-core';

import { projects } from "./projects.js";

export const categories = mysqlTable("categories", {
  id: serial("id").primaryKey(),
  projectId: bigint("project_id", { mode: 'number' })
    .notNull()
    .references(() => projects.id),
  categoryName: varchar("category_name", { length: 30 }).notNull(),
  createdAt: timestamp("created_at").defaultNow()
});