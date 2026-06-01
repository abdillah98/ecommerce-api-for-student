import { mysqlTable, serial, varchar, bigint, text, timestamp } from 'drizzle-orm/mysql-core';

import { projects } from "./projects.js";

export const paymentMethods = mysqlTable("payment_methods", {
  id: serial("id").primaryKey(),
  projectId: bigint("project_id", { mode: 'number' })
    .notNull()
    .references(() => projects.id),
  name: varchar("name", { length: 50 }).notNull(),
  type: varchar("type", { length: 10 }).notNull(), // wallet, bank
  logoUrl: text("logo_url"),
  createdAt: timestamp("created_at").defaultNow()
});
