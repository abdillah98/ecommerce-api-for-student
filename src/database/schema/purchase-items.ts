import { mysqlTable, serial, decimal, int, bigint } from 'drizzle-orm/mysql-core';

import { purchases } from "./purchases.js";
import { products } from "./products.js";

export const purchaseItems = mysqlTable("purchase_items", {
  id: serial("id").primaryKey(),
  purchaseId: bigint("purchase_id", { mode: 'number', unsigned: true }).notNull().references(() => purchases.id),
  productId: bigint("product_id", { mode: 'number', unsigned: true }).notNull().references(() => products.id),
  quantity: int("quantity").notNull(),
  price: decimal("price", { precision: 10, scale: 2, mode: 'number' }).notNull()
});