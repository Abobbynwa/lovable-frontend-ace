import pool from "../config/db.js";

export const getStudentDashboard = (req, res) => {
  res.json({ message: "Student dashboard active" });
};

// ATTENDANCE
export const getAttendance = async (req, res) => {
  const result = await pool.query(
    "SELECT * FROM attendance WHERE student_id=$1",
    [req.params.id]
  );
  res.json(result.rows);
};

// RESULTS
export const getResults = async (req, res) => {
  const result = await pool.query(
    "SELECT * FROM results WHERE student_id=$1",
    [req.params.id]
  );
  res.json(result.rows);
};

// ASSIGNMENTS
export const getAssignments = async (req, res) => {
  const result = await pool.query(
    "SELECT * FROM assignments WHERE class=$1",
    [req.params.className]
  );
  res.json(result.rows);
};

// TIMETABLE
export const getTimetable = async (req, res) => {
  const result = await pool.query(
    "SELECT * FROM timetable WHERE class=$1",
    [req.params.className]
  );
  res.json(result.rows);
};
