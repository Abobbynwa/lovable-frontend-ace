import express from "express";
import { protect } from "../middleware/auth.js";
import {
  createStudent,
  createStaff,
  getAllStudents,
  getAllStaff,
  adminDashboard
} from "../controllers/adminController.js";

const router = express.Router();

router.get("/dashboard", protect(), adminDashboard);
router.post("/create-student", protect(["admin"]), createStudent);
router.post("/create-staff", protect(["admin"]), createStaff);
router.get("/students", protect(), getAllStudents);
router.get("/staff", protect(), getAllStaff);

export default router;
