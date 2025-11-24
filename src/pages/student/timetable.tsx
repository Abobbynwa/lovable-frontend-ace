// src/pages/student/timetable.tsx
import React from "react";

const StudentLayout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return (
    <div className="min-h-screen bg-gray-100 p-6">
      <div className="max-w-4xl mx-auto">{children}</div>
    </div>
  );
};

export const StudentTimetable: React.FC = () => {
  return (
    <StudentLayout>
      <h1 className="text-xl font-semibold mb-4">Timetable</h1>
      <div className="bg-white p-4 rounded shadow">Timetable view</div>
    </StudentLayout>
  );
};
