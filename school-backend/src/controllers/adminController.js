import pool from "../config/db.js";
import bcrypt from "bcryptjs";

export const adminDashboard = (req, res) => {
  res.json({ message: "Admin dashboard active" });
};

export const createStudent = async (req, res) => {
  try {
    const { full_name, email, password, className, age, guardian } = req.body;

    const hashed = await bcrypt.hash(password, 10);

    const userResult = await pool.query(
      "INSERT INTO users (full_name, email, password, role) VALUES ($1,$2,$3,'student') RETURNING id",
      [full_name, email, hashed]
    );

    const userId = userResult.rows[0].id;

    await pool.query(
      "INSERT INTO students (user_id, class, age, guardian) VALUES ($1,$2,$3,$4)",
      [userId, className, age, guardian]
    );

    res.json({ message: "Student created successfully" });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

export const createStaff = async (req, res) => {
  try {
    const { full_name, email, password, subject, position } = req.body;

    const hashed = await bcrypt.hash(password, 10);

    const userResult = await pool.query(
      "INSERT INTO users (full_name, email, password, role) VALUES ($1,$2,$3,'staff') RETURNING id",
      [full_name, email, hashed]
    );

    const userId = userResult.rows[0].id;

    await pool.query(
      "INSERT INTO staff (user_id, subject, position) VALUES ($1,$2,$3)",
      [userId, subject, position]
    );

    res.json({ message: "Staff created successfully" });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

export const getAllStudents = async (req, res) => {
  const result = await pool.query(
    "SELECT users.full_name, users.email, students.* FROM students JOIN users ON users.id = students.user_id"
  );
  res.json(result.rows);
};

export const getAllStaff = async (req, res) => {
  const result = await pool.query(
    "SELECT users.full_name, users.email, staff.* FROM staff JOIN users ON users.id = staff.user_id"
  );
  res.json(result.rows);
};
