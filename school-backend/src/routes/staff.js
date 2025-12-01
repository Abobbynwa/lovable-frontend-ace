import express from "express";
import { allowRoles } from "../middleware/roleAuth.js";
import { protect } from "../middleware/auth.js";

import {
  getStaffDashboard,
  markAttendance,
  addResult,
  createAssignment
} from "../controllers/staffController.js";

const router = express.Router();

// Apply authentication + role check for all staff routes
router.use(protect, allowRoles("staff"));

// Staff Routes
router.get("/dashboard", getStaffDashboard);
router.post("/attendance", markAttendance);
router.post("/results", addResult);
router.post("/assignments", createAssignment);

export default router;
