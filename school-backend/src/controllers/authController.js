import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { pool } from "../config/db.js";

// =======================================
// REGISTER USER (ADMIN ONLY)
// =======================================
export const register = async (req, res) => {
  try {
    const { full_name, email, password, role } = req.body;

    // Only admin can register staff or students
    if (req.user.role !== "admin") {
      return res.status(403).json({ message: "Only admin can create accounts." });
    }

    // Prevent creating new admins (optional)
    if (!["staff", "student"].includes(role)) {
      return res.status(400).json({ message: "Role must be 'staff' or 'student'" });
    }

    // Check if email already exists
    const existingUser = await pool.query(
      "SELECT id FROM users WHERE email = $1",
      [email]
    );

    if (existingUser.rows.length > 0) {
      return res.status(400).json({ message: "Email already exists" });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 12);

    // Insert new user
    const newUser = await pool.query(
      `INSERT INTO users (full_name, email, password, role) 
       VALUES ($1,$2,$3,$4) 
       RETURNING id, full_name, email, role, created_at`,
      [full_name, email, hashedPassword, role]
    );

    res.json({
      message: "User created successfully",
      user: newUser.rows[0],
    });

  } catch (err) {
    console.error("REGISTER ERROR:", err.message);
    res.status(500).json({ error: "Server error during registration" });
  }
};

// =======================================
// LOGIN USER
// =======================================
export const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Find user
    const result = await pool.query(
      "SELECT * FROM users WHERE email = $1",
      [email]
    );

    const user = result.rows[0];
    if (!user) {
      return res.status(400).json({ message: "Invalid email or password" });
    }

    // Compare passwords
    const match = await bcrypt.compare(password, user.password);
    if (!match) {
      return res.status(400).json({ message: "Invalid email or password" });
    }

    // Create JWT
    const token = jwt.sign(
      { id: user.id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: "7d" }
    );

    res.json({
      message: "Login successful",
      token,
      user: {
        id: user.id,
        full_name: user.full_name,
        email: user.email,
        role: user.role,
      },
    });

  } catch (err) {
    console.error("LOGIN ERROR:", err.message);
    res.status(500).json({ error: "Server error during login" });
  }
};
// =======================================