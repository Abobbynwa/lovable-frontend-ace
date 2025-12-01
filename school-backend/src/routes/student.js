import express from "express";
import { allowRoles } from "../middleware/roleAuth.js";
import { protect } from "../middleware/auth.js";

import {
  getStudentDashboard,
  getAttendance,
  getResults,
  getAssignments,
  getTimetable
} from "../controllers/studentController.js";

const router = express.Router();

// Apply authentication + role check for all student routes
router.use(protect, allowRoles("student"));

// Student Routes
router.get("/dashboard", getStudentDashboard);
router.get("/attendance/:id", getAttendance);
router.get("/results/:id", getResults);
router.get("/assignments/:className", getAssignments);
router.get("/timetable/:className", getTimetable);

export default router;
