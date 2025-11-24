// src/pages/staff/timetable.tsx
import React from "react";
import { StaffLayout } from "../../layouts/StaffLayout";

export const StaffTimetable: React.FC = () => {
  return (
    <StaffLayout>
      <h1 className="text-xl font-semibold mb-4">Timetable</h1>
      <div className="bg-white p-4 rounded shadow">Timetable view</div>
    </StaffLayout>
  );
};
