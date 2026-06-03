import { db } from "../src/database/db.js";
import { sql } from "drizzle-orm";
import { migrate } from "drizzle-orm/mysql2/migrator";

async function main() {
  console.log("1. Cleaning up database tables...");
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
    "__drizzle_migrations"
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
  
  console.log("2. Running migrations programmatically on empty DB...");
  try {
    await migrate(db, { migrationsFolder: "./src/database/migrations" });
    console.log("Migrations applied successfully!");
    process.exit(0);
  } catch (err) {
    console.error("Migration failed with error:", err);
    process.exit(1);
  }
}

main().catch(err => {
  console.error("Fatal error:", err);
  process.exit(1);
});
