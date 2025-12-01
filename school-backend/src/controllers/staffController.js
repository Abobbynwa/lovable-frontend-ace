import {pool} from "../config/db.js";

export const getStaffDashboard = (req, res) => {
  res.json({ message: "Staff dashboard active" });
};

// MARK ATTENDANCE
export const markAttendance = async (req, res) => {
  const { student_id, date, status } = req.body;

  await pool.query(
    "INSERT INTO attendance (student_id,date,status) VALUES ($1,$2,$3)",
    [student_id, date, status]
  );

  res.json({ message: "Attendance recorded" });
};

// ADD RESULT
export const addResult = async (req, res) => {
  const { student_id, subject, score, term } = req.body;

  await pool.query(
    "INSERT INTO results (student_id,subject,score,term) VALUES ($1,$2,$3,$4)",
    [student_id, subject, score, term]
  );

  res.json({ message: "Result added" });
};

// ADD ASSIGNMENT
export const createAssignment = async (req, res) => {
  const { staff_id, className, title, description, due_date } = req.body;

  await pool.query(
    "INSERT INTO assignments (staff_id,class,title,description,due_date) VALUES ($1,$2,$3,$4,$5)",
    [staff_id, className, title, description, due_date]
  );

  res.json({ message: "Assignment created" });
};
