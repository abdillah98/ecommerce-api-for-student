import { db } from "../src/database/db.js";
import { sql } from "drizzle-orm";

async function main() {
  console.log("Dropping existing tables including Drizzle migration metadata table...");
  
  await db.execute(sql`SET FOREIGN_KEY_CHECKS = 0;`);
  
  const tables = [
    "carts", 
    "categories", 
    "payment_methods", 
    "products", 
    "projects", 
    "purchase_items", 
    "purchases", 
    "users",
    "__drizzle_migrations" // Drizzle metadata table
  ];
  
  for (const table of tables) {
    try {
      await db.execute(sql`DROP TABLE IF EXISTS ${sql.raw(table)};`);
      console.log(`Dropped table ${table} if existed.`);
    } catch (e) {
      console.error(`Failed to drop table ${table}:`, e);
    }
  }
  
  await db.execute(sql`SET FOREIGN_KEY_CHECKS = 1;`);
  console.log("Cleanup completed successfully!");
  process.exit(0);
}

main().catch(err => {
  console.error(err);
  process.exit(1);
});
