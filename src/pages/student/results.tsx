// src/pages/student/results.tsx
import React from "react";
import { SimpleTable } from "../../components/tables/SimpleTable";

const StudentLayout: React.FC<React.PropsWithChildren<{}>> = ({ children }) => (
  <div className="min-h-screen bg-gray-50 p-6">
    <div className="max-w-4xl mx-auto">{children}</div>
  </div>
);

export const StudentResults: React.FC = () => {
  const columns = ["subject", "score", "grade"];
  const data = [
    { subject: "Math", score: 85, grade: "B+" },
    { subject: "English", score: 90, grade: "A" },
  ];
  return (
    <StudentLayout>
      <h1 className="text-xl font-semibold mb-4">Results</h1>
      <SimpleTable columns={columns} data={data} />
    </StudentLayout>
  );
};
