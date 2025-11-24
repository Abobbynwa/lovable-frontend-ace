// src/pages/admin/students.tsx
import React from "react";
import { AdminLayout } from "../../components/layout/AdminLayout";
import { SimpleTable } from "../../components/tables/SimpleTable";

export const AdminStudents: React.FC = () => {
  const columns = ["id", "name", "class", "email"];
  const data = [
    { id: "s1", name: "John Doe", class: "JSS1", email: "john@example.com" },
    { id: "s2", name: "Jane Roe", class: "JSS2", email: "jane@example.com" },
  ];
  return (
    <AdminLayout>
      <h1 className="text-xl font-semibold mb-4">Manage Students</h1>
      <SimpleTable columns={columns} data={data} />
    </AdminLayout>
  );
};
