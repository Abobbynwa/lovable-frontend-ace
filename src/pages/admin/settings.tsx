// src/pages/admin/settings.tsx
import React from "react";
import { AdminLayout } from "../../components/layout/AdminLayout";

export const AdminSettings: React.FC = () => {
  return (
    <AdminLayout>
      <h1 className="text-xl font-semibold mb-4">Settings</h1>
      <div className="bg-white p-4 rounded shadow">School settings UI</div>
    </AdminLayout>
  );
};
