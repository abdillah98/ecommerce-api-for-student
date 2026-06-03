import { defineConfig } from "drizzle-kit";
import * as dotenv from 'dotenv';

// Muat file .env ke dalam process.env sebelum config dibaca
dotenv.config({ path: '.env' });

export default defineConfig({
  schema: "./src/database/schema/",
  out: "./src/database/migrations",
  dialect: "mysql",
  dbCredentials: {
    // url: (globalThis as any).process.env.DATABASE_URL as string,
    host: process.env.DB_HOST || '127.0.0.1',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME || 'nama_database_anda',
    port: Number(process.env.DB_PORT) || 3306, // Port harus bertipe number
  }
});