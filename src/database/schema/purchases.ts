import { mysqlTable, serial, varchar, bigint, decimal, text, timestamp } from 'drizzle-orm/mysql-core';

import { projects } from "./projects.js";
import { users } from "./users.js";
import { paymentMethods } from "./payment-methods.js";

export const purchases = mysqlTable("purchases", {
  id: serial("id").primaryKey(),
  projectId: bigint("project_id", { mode: 'number', unsigned: true }).notNull().references(() => projects.id),
  userId: bigint("user_id", { mode: 'number', unsigned: true }).notNull().references(() => users.id),
  totalPrice: decimal("total_price", { precision: 10, scale: 2, mode: 'number' }).notNull(),
  status: varchar("status", { length: 20 }).default("pending"),
  address: text("address").notNull(),
  paymentMethodId: bigint("payment_method_id", { mode: 'number', unsigned: true })
    .notNull()
    .references(() => paymentMethods.id),
  createdAt: timestamp("created_at").defaultNow()
});