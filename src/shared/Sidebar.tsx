// src/shared/Sidebar.tsx
import React from "react";
import { Link } from "react-router-dom";
type Role = "admin" | "staff" | "student";

const menus: Record<Role, { to: string; label: string }[]> = {
  admin: [
    { to: "/admin/dashboard", label: "Dashboard" },
    { to: "/admin/students", label: "Students" },
    { to: "/admin/staff", label: "Staff" },
    { to: "/admin/classes", label: "Classes" },
    { to: "/admin/subjects", label: "Subjects" },
    { to: "/admin/reports", label: "Reports" },
    { to: "/admin/settings", label: "Settings" },
  ],
  staff: [
    { to: "/staff/dashboard", label: "Dashboard" },
    { to: "/staff/attendance", label: "Attendance" },
    { to: "/staff/marks", label: "Marks" },
    { to: "/staff/timetable", label: "Timetable" },
    { to: "/staff/profile", label: "Profile" },
  ],
  student: [
    { to: "/student/dashboard", label: "Dashboard" },
    { to: "/student/attendance", label: "Attendance" },
    { to: "/student/results", label: "Results" },
    { to: "/student/assignments", label: "Assignments" },
    { to: "/student/timetable", label: "Timetable" },
    { to: "/student/profile", label: "Profile" },
  ],
};

export const Sidebar: React.FC<{ role: Role }> = ({ role }) => {
  return (
    <aside className="w-64 bg-slate-800 text-white min-h-screen p-4">
      <div className="mb-6 text-2xl font-bold">School</div>
      <nav className="flex flex-col gap-2">
        {menus[role].map((it) => (
          <Link key={it.to} to={it.to} className="block px-3 py-2 rounded hover:bg-slate-700">
            {it.label}
          </Link>
        ))}
      </nav>
    </aside>
  );
};
