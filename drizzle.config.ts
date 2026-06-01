import { defineConfig } from "drizzle-kit";

export default defineConfig({
  schema: "./src/database/schema/",
  out: "./src/database/migrations",
  dialect: "mysql",
  dbCredentials: {
    url: (globalThis as any).process.env.DATABASE_URL as string,
  }
});