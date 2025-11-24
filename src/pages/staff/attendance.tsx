// src/pages/staff/attendance.tsx
import React from "react";
import { StaffLayout } from "../../layouts/StaffLayout";

export const StaffAttendance: React.FC = () => {
  return (
    <StaffLayout>
      <h1 className="text-xl font-semibold mb-4">Take Attendance</h1>
      <div className="bg-white p-4 rounded shadow">Attendance form/table (implement)</div>
    </StaffLayout>
  );
};
