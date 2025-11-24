// src/pages/student/profile.tsx
import React from "react";

// Local StudentLayout used when the shared layout module is missing
const StudentLayout: React.FC<{ children?: React.ReactNode }> = ({ children }) => {
  return <div className="min-h-screen bg-gray-50 p-6">{children}</div>;
};

export const StudentProfile: React.FC = () => {
  return (
    <StudentLayout>
      <h1 className="text-xl font-semibold mb-4">Profile</h1>
      <div className="bg-white p-4 rounded shadow">Student profile</div>
    </StudentLayout>
  );
};
