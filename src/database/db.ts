import { drizzle } from 'drizzle-orm/mysql2';
import mysql from 'mysql2/promise';
import dotenv from 'dotenv';

dotenv.config();

// Membuat koneksi pool ke database MySQL menggunakan URL dari .env
const connection = await mysql.createConnection(process.env.DATABASE_URL as string);

export const db = drizzle(connection);