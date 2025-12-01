import pkg from "pg";
import cors from "cors";
import express from "express";
import dotenv from "dotenv";
import { pool } from "./src/config/db.js";
import authRoutes from "./src/routes/authRoutes.js";
import studentRoutes from "./src/routes/studentRoutes.js";
import teacherRoutes from "./src/routes/teacherRoutes.js";
import classRoutes from "./src/routes/classRoutes.js";
import attendanceRoutes from "./src/routes/attendanceRoutes.js";

app.use(cors({
  origin: [
    "https://lovable-ace.vercel.app/"
  ],
  credentials: true
}));

const { Pool } = pkg;

export const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: {
    rejectUnauthorized: false
  },
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 5000,
  max: 10,
  keepAlive: true
});

pool.on("connect", () => {
  console.log("✅ PostgreSQL Connected");
});

pool.on("error", (err) => {
  console.error("❌ PostgreSQL Error:", err);
});
