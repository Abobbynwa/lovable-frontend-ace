// src/shared/Navbar.tsx
import React from "react";
// Make sure useAuth is exported from the correct file
// Update the path below to the correct location of useAuth
import { useAuth } from "../hooks/useAuth"; // If useAuth is not in ../hooks/, update this path

export const Navbar: React.FC = () => {
  const { teacher, logout } = useAuth();
  return (
    <header className="flex items-center justify-between px-4 py-2 bg-white shadow">
      <div className="text-lg font-semibold">School Portal</div>
      <div className="flex items-center gap-4">
        {teacher && <div className="text-sm">{teacher.name}</div>}
        <button onClick={logout} className="px-3 py-1 text-sm bg-red-500 text-white rounded">Logout</button>
      </div>
    </header>
  );
};
