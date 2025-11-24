import express from "express";
import { allowRoles } from "../middleware/roleAuth.js";

import { auth } from "../middleware/auth.js";
import {
  getStudentDashboard,
  getAttendance,
  getResults,
  getAssignments,
  getTimetable
} from "../controllers/studentController.js";

const router = express.Router();

router.get("/dashboard", auth, getStudentDashboard);
router.get("/attendance/:id", auth, getAttendance);
router.get("/results/:id", auth, getResults);
router.get("/assignments/:className", auth, getAssignments);
router.get("/timetable/:className", auth, getTimetable);
router.use(auth, allowRoles("student"));

export default router;
