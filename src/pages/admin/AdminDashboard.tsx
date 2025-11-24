// src/pages/admin/dashboard.tsx
import React from "react";
import { Card } from "../../components/cards/Card";
import { AdminLayout } from "../../components/layout/AdminLayout";

export const AdminDashboard: React.FC = () => {
  return (
    <AdminLayout>
      <div className="space-y-6">
        <h1 className="text-2xl font-semibold">Admin Dashboard</h1>
        <div className="grid grid-cols-3 gap-4">
          <Card title="Students">120</Card>
          <Card title="Staff">12</Card>
          <Card title="Classes">8</Card>
        </div>
      </div>
    </AdminLayout>
  );
};
