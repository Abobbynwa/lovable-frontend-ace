import express from "express";
import auth  from "../middleware/auth.js";
import {
  createStudent,
  createStaff,
  getAllStudents,
  getAllStaff,
  adminDashboard
} from "../controllers/adminController.js";

const router = express.Router();

router.get("/dashboard", auth, adminDashboard);
router.post("/create-student", auth, createStudent);
router.post("/create-staff", auth, createStaff);
router.get("/students", auth, getAllStudents);
router.get("/staff", auth, getAllStaff);

export default router;
