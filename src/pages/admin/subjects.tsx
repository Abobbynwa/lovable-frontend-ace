// src/pages/admin/subjects.tsx
import React from "react";
import { AdminLayout } from "../../components/layout/AdminLayout";

export const AdminSubjects: React.FC = () => {
  return (
    <AdminLayout>
      <h1 className="text-xl font-semibold mb-4">Subjects</h1>
      <div className="bg-white p-4 rounded shadow">Subject management UI</div>
    </AdminLayout>
  );
};
