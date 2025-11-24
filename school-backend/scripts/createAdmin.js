import { pool } from "../src/config/db.js";
import bcrypt from "bcryptjs";

const createAdmin = async () => {
  const password = await bcrypt.hash("Admin123", 10);

  await pool.query(
    `INSERT INTO users (full_name, email, password, role)
     VALUES ($1,$2,$3,'admin')
     ON CONFLICT (email) DO NOTHING`,
    ["Super Admin", "admin@school.com", password]
  );

  console.log("✅ Admin created: admin@school.com / Admin123");
  process.exit();
};

createAdmin();
