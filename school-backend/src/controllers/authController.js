import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import pool from "../config/db.js";

// ============ REGISTER USER (ADMIN ONLY) ============
export const register = async (req, res) => {
  try {
    const { full_name, email, password, role } = req.body;

    // Only admin can register others
    if (req.user.role !== "admin") {
      return res.status(403).json({ message: "Only admin can create accounts." });
    }

    // Prevent admin from creating admin via API (optional safety)
    if (!["staff", "student"].includes(role)) {
      return res.status(400).json({ message: "Role must be staff or student" });
    }

    const hashed = await bcrypt.hash(password, 12);

    const user = await db.query(
      "INSERT INTO users (full_name, email, password, role) VALUES ($1,$2,$3,$4) RETURNING id, full_name, email, role, created_at",
      [full_name, email, hashed, role]
    );

    res.json({ message: "User created", user: user.rows[0] });

  } catch (err) {
    console.log(err);
    res.status(500).json({ error: err.message });
  }
};

// ============ LOGIN ============
export const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    const result = await db.query("SELECT * FROM users WHERE email=$1", [email]);
    const user = result.rows[0];

    if (!user)
      return res.status(400).json({ message: "Invalid email or password" });

    const match = await bcrypt.compare(password, user.password);
    if (!match)
      return res.status(400).json({ message: "Invalid email or password" });

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
    res.status(500).json({ error: err.message });
  }
};
