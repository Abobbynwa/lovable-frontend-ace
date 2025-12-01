import express from "express";
import { allowRoles } from "../middleware/roleAuth.js";

import   { protect }  from "../middleware/auth.js";
import {
  getStaffDashboard,
  markAttendance,
  addResult,
  createAssignment
} from "../controllers/staffController.js";

const router = express.Router();

router.get("/dashboard", auth, getStaffDashboard);
router.post("/attendance", auth, markAttendance);
router.post("/results", auth, addResult);
router.post("/assignments", auth, createAssignment);
router.use(auth, allowRoles("staff"));

export default router;
