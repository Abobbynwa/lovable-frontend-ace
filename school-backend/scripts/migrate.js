import { pool } from "../src/config/db.js";
import fs from "fs";
import path from "path";

const sqlFile = path.resolve("src/models/users.sql");

const runMigration = async () => {
  const sql = fs.readFileSync(sqlFile).toString();
  await pool.query(sql);
  console.log("✅ Migration complete");
  process.exit();
};


const migrate = async () => {
  try {
    await pool.query(`

      -- USERS TABLE
      CREATE TABLE IF NOT EXISTS users (
        id SERIAL PRIMARY KEY,
        full_name VARCHAR(255) NOT NULL,
        email VARCHAR(255) UNIQUE NOT NULL,
        password VARCHAR(255) NOT NULL,
        role VARCHAR(50) NOT NULL CHECK (role IN ('admin','staff','student')),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );

      -- STUDENTS TABLE
      CREATE TABLE IF NOT EXISTS students (
        id SERIAL PRIMARY KEY,
        user_id INTEGER UNIQUE REFERENCES users(id) ON DELETE CASCADE ON UPDATE CASCADE,
        class VARCHAR(50),
        age INTEGER,
        gender VARCHAR(20),
        picture TEXT,
        subjects TEXT[] DEFAULT '{}',
        department VARCHAR(50),
        parent_name VARCHAR(255),
        parent_address TEXT,
        genotype VARCHAR(10),
        blood_group VARCHAR(10),
        state_of_origin VARCHAR(100),
        house_address TEXT
      );

      -- STAFF TABLE
      CREATE TABLE IF NOT EXISTS staff (
        id SERIAL PRIMARY KEY,
        user_id INTEGER UNIQUE REFERENCES users(id) ON DELETE CASCADE ON UPDATE CASCADE,
        age INTEGER,
        gender VARCHAR(20),
        address TEXT,
        state_of_origin VARCHAR(100),
        genotype VARCHAR(10),
        subject VARCHAR(100),
        position VARCHAR(100),
        class_teaching VARCHAR(50),
        account_details TEXT
      );

      -- ATTENDANCE TABLE
      CREATE TABLE IF NOT EXISTS attendance (
        id SERIAL PRIMARY KEY,
        student_id INTEGER REFERENCES students(id) ON DELETE CASCADE ON UPDATE CASCADE,
        date DATE NOT NULL,
        status VARCHAR(20) NOT NULL
      );

      -- RESULTS TABLE
      CREATE TABLE IF NOT EXISTS results (
        id SERIAL PRIMARY KEY,
        student_id INTEGER REFERENCES students(id) ON DELETE CASCADE ON UPDATE CASCADE,
        subject VARCHAR(100) NOT NULL,
        score INTEGER NOT NULL,
        term VARCHAR(50) NOT NULL
      );

      -- ASSIGNMENTS TABLE
      CREATE TABLE IF NOT EXISTS assignments (
        id SERIAL PRIMARY KEY,
        staff_id INTEGER REFERENCES staff(id) ON DELETE CASCADE ON UPDATE CASCADE,
        class VARCHAR(50),
        title VARCHAR(255) NOT NULL,
        description TEXT,
        due_date DATE
      );

      -- TIMETABLE TABLE
      CREATE TABLE IF NOT EXISTS timetable (
        id SERIAL PRIMARY KEY,
        class VARCHAR(50),
        day VARCHAR(50),
        subject VARCHAR(100),
        time VARCHAR(100)
      );

    `);

    console.log("✅ Migration completed successfully.");
    process.exit();
  } catch (err) {
    console.error("❌ Migration error:", err);
    process.exit(1);
  }
};

runMigration();
migrate();