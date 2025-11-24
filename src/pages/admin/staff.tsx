// src/pages/admin/staff.tsx
import React from "react";
import { AdminLayout } from "../../components/layout/AdminLayout";
import { SimpleTable } from "../../components/tables/SimpleTable";

export const AdminStaff: React.FC = () => {
  const columns = ["id", "name", "role", "email"];
  const data = [{ id: "t1", name: "Mr. Smith", role: "Teacher", email: "smith@school.com" }];
  return (
    <AdminLayout>
      <h1 className="text-xl font-semibold mb-4">Staff</h1>
      <SimpleTable columns={columns} data={data} />
    </AdminLayout>
  );
};
