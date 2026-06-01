import { drizzle } from 'drizzle-orm/mysql2';
import mysql from 'mysql2/promise';
import dotenv from 'dotenv';

dotenv.config();

// Membuat koneksi pool ke database MySQL menggunakan URL dari .env
// const connection = await mysql.createConnection(process.env.DATABASE_URL as string);

// Jika di Hostinger, gunakan konfigurasi objek terpisah seperti ini
const pool = mysql.createPool({
  host: process.env.DB_HOST || '127.0.0.1',
  port: parseInt(process.env.DB_PORT as string) || 3306,
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || 'Abc@12345',
  database: process.env.DB_NAME || 'student_commerce',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});

export const db = drizzle(pool);