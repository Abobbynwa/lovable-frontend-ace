// src/pages/student/attendance.tsx
import React from "react";
import { StudentLayout } from "../../layouts/StudentLayout";

export const StudentAttendance: React.FC = () => {
  return (
    <StudentLayout>
      <h1 className="text-xl font-semibold mb-4">Attendance</h1>
      <div className="bg-white p-4 rounded shadow">Attendance records</div>
    </StudentLayout>
  );
};
