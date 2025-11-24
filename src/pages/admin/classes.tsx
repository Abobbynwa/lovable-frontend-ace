// src/pages/admin/classes.tsx
import React from "react";
import { AdminLayout } from "../../components/layout/AdminLayout";

export const AdminClasses: React.FC = () => {
  return (
    <AdminLayout>
      <h1 className="text-xl font-semibold mb-4">Classes</h1>
      <div className="bg-white p-4 rounded shadow">Class management UI (create/edit)</div>
    </AdminLayout>
  );
};
