// src/pages/student/assignments.tsx
import React from "react";
import { StudentLayout } from "../../layouts/StudentLayout";

export const StudentAssignments: React.FC = () => {
  return (
    <StudentLayout>
      <h1 className="text-xl font-semibold mb-4">Assignments</h1>
      <div className="bg-white p-4 rounded shadow">Assignments list</div>
    </StudentLayout>
  );
};
