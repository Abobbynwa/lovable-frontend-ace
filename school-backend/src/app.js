import express from "express";
import authRoutes from "./routes/auth.js";
import adminRoutes from "./routes/admin.js";
import staffRoutes from "./routes/staff.js";
import studentRoutes from "./routes/student.js";

const router = express.Router();

// Route mapping
router.use("/auth", authRoutes);
router.use("/admin", adminRoutes);
router.use("/staff", staffRoutes);
router.use("/student", studentRoutes);

// Health check
router.get("/", (req, res) => {
  res.send("School Backend API Running");
});

export default router;
