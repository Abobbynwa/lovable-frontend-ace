// src/pages/admin/reports.tsx
import React from "react";
import { AdminLayout } from "../../components/layout/AdminLayout";

export const AdminReports: React.FC = () => {
  return (
    <AdminLayout>
      <h1 className="text-xl font-semibold mb-4">Reports</h1>
      <div className="bg-white p-4 rounded shadow">Reports & exports</div>
    </AdminLayout>
  );
};
