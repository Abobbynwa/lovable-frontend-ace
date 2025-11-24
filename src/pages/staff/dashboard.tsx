// src/pages/staff/dashboard.tsx
import React from "react";
import { StaffLayout } from "../../layouts/StaffLayout";
import { Card } from "../../components/cards/Card";

export const StaffDashboard: React.FC = () => {
  return (
    <StaffLayout>
      <h1 className="text-2xl font-semibold">Staff Dashboard</h1>
      <div className="grid grid-cols-2 gap-4 mt-4">
        <Card title="My Classes">3 classes</Card>
        <Card title="Pending Attendance">2 sessions</Card>
      </div>
    </StaffLayout>
  );
};
