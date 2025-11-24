// src/layouts/StudentLayout.tsx
import React from "react";
import { Navbar } from "../shared/Navbar";
import { Sidebar } from "../shared/Sidebar";

export const StudentLayout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return (
    <div className="min-h-screen flex">
      <Sidebar role="student" />
      <div className="flex-1 flex flex-col">
        <Navbar />
        <main className="p-6 bg-slate-100 flex-1">{children}</main>
      </div>
    </div>
  );
};
