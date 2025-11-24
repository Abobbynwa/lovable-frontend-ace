// src/pages/staff/marks.tsx
import React from "react";
import { StaffLayout } from "../../layouts/StaffLayout";

export const StaffMarks: React.FC = () => {
  return (
    <StaffLayout>
      <h1 className="text-xl font-semibold mb-4">Enter Marks</h1>
      <div className="bg-white p-4 rounded shadow">Marks input UI</div>
    </StaffLayout>
  );
};
