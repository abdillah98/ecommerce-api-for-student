import { db } from "../src/database/db.js";
import { migrate } from "drizzle-orm/mysql2/migrator";

async function main() {
  console.log("Running migrations programmatically...");
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
  console.error("Unhandle error in migrations:", err);
  process.exit(1);
});
