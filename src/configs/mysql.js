import dotenv from "dotenv";
dotenv.config();
import mysql from "mysql2/promise";

async function createDB() {
  const conn = await mysql.createConnection({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
  });
  await conn.query("CREATE DATABASE nexus_db");
  await conn.query("USE nexus_db");
  await conn.query(`CREATE TABLE IF NOT EXISTS uploads (
      id INT AUTO_INCREMENT PRIMARY KEY,
      public_id VARCHAR(255) NOT NULL,
      url TEXT NOT NULL,
      compressed_url TEXT,
      compressed_public_id VARCHAR(255),
      status ENUM('pending', 'processing', 'completed', 'failed') DEFAULT 'pending',
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )`);
  console.log("Database + table created successfully!");
  process.exit(0);
}

createDB();
