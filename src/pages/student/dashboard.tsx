// src/pages/student/dashboard.tsx
import React from "react";
import { StudentLayout } from "../../layouts/StudentLayout";
import { Card } from "../../components/cards/Card";

export const StudentDashboard: React.FC = () => {
  return (
    <StudentLayout>
      <h1 className="text-2xl font-semibold">Student Dashboard</h1>
      <div className="grid grid-cols-3 gap-4 mt-4">
        <Card title="Attendance">92%</Card>
        <Card title="GPA">3.6</Card>
        <Card title="Next Exam">2026-02-05</Card>
      </div>
    </StudentLayout>
  );
};
