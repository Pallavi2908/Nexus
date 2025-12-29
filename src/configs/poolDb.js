import dotenv from "dotenv";
dotenv.config();
import mysql from "mysql2/promise";

export const pool = mysql.createPool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: "nexus_db",
  waitForConnections: true,
  connectionLimit: 30,
  maxIdle: 30,
  idleTimeout: 60000,
  queueLimit: 0,
  enableKeepAlive: true,
  keepAliveInitialDelay: 0,
});
