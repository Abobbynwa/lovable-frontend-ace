import {pool} from "../config/db.js";
import bcrypt from "bcryptjs";

// ADMIN DASHBOARD
export const adminDashboard = (req, res) => {
  res.json({ message: "Admin dashboard active" });
};

// CREATE STUDENT
export const createStudent = async (req, res) => {
  try {
    const {
      full_name,
      email,
      password,
      className,
      age,
      gender,
      picture,
      subject_offered,
      department,
      parent_name,
      parent_address,
      genotype,
      blood_group,
      state_of_origin,
      house_address
    } = req.body;

    const hashed = await bcrypt.hash(password, 10);

    const userResult = await pool.query(
      "INSERT INTO users (full_name,email,password,role) VALUES ($1,$2,$3,'student') RETURNING id",
      [full_name, email, hashed]
    );

    const userId = userResult.rows[0].id;

    await pool.query(
      `INSERT INTO students 
      (user_id, class, age, gender, picture, subject_offered, department, parent_name, parent_address, genotype, blood_group, state_of_origin, house_address)
      VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13)`,
      [
        userId,
        className,
        age,
        gender,
        picture,
        subject_offered,
        department,
        parent_name,
        parent_address,
        genotype,
        blood_group,
        state_of_origin,
        house_address
      ]
    );

    res.json({ message: "Student created successfully" });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

// CREATE STAFF
export const createStaff = async (req, res) => {
  try {
    const {
      full_name,
      email,
      password,
      age,
      gender,
      class_teaching,
      class_teacher_of,
      address,
      state_of_origin,
      genotype,
      subject,
      account_details
    } = req.body;

    const hashed = await bcrypt.hash(password, 10);

    const userResult = await pool.query(
      "INSERT INTO users (full_name,email,password,role) VALUES ($1,$2,$3,'staff') RETURNING id",
      [full_name, email, hashed]
    );

    const userId = userResult.rows[0].id;

    await pool.query(
      `INSERT INTO staff 
      (user_id, age, gender, class_teaching, class_teacher_of, address, state_of_origin, genotype, subject, account_details)
      VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10)`,
      [
        userId,
        age,
        gender,
        class_teaching,
        class_teacher_of,
        address,
        state_of_origin,
        genotype,
        subject,
        account_details
      ]
    );

    res.json({ message: "Staff created successfully" });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

// GET ALL STUDENTS
export const getAllStudents = async (req, res) => {
  const result = await pool.query(`
    SELECT users.full_name, users.email, students.* 
    FROM students 
    JOIN users ON users.id = students.user_id
  `);
  res.json(result.rows);
};

// GET ALL STAFF
export const getAllStaff = async (req, res) => {
  const result = await pool.query(`
    SELECT users.full_name, users.email, staff.* 
    FROM staff 
    JOIN users ON users.id = staff.user_id
  `);
  res.json(result.rows);
};
