import { mysqlTable, serial, varchar, timestamp, bigint, text } from 'drizzle-orm/mysql-core';

import { projects } from "./projects.js";

export const users = mysqlTable("users", {
  id: serial("id").primaryKey(),
  projectId: bigint("project_id", { mode: 'number' })
    .notNull()
    .references(() => projects.id),
  name: varchar("name", { length: 50 }).notNull(),
  email: varchar("email", { length: 30 }).notNull().unique(),
  password: text("password").notNull(),
  role: varchar("role", { length: 20 }).default("customer"),
  createdAt: timestamp("created_at").defaultNow()
});