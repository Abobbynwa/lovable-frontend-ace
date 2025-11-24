// src/pages/student/login.tsx
import React from "react";
import { useAuth } from "../../utils/auth";

export const StudentLogin: React.FC = () => {
  const { login } = useAuth();
  const [id, setId] = React.useState("");
  const [pw, setPw] = React.useState("");
  const handle = async (e: React.FormEvent) => {
    e.preventDefault();
    await login("student", { email: id, password: pw });
  };
  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50">
      <div className="w-full max-w-md p-6 bg-white rounded shadow">
        <h2 className="text-xl font-semibold mb-4">Student Login</h2>
        <form onSubmit={handle} className="space-y-3">
          <input value={id} onChange={(e)=>setId(e.target.value)} required placeholder="Student ID or Email" className="w-full p-2 border rounded" />
          <input value={pw} onChange={(e)=>setPw(e.target.value)} required type="password" placeholder="Password" className="w-full p-2 border rounded" />
          <button className="w-full p-2 rounded bg-green-600 text-white">Login</button>
        </form>
      </div>
    </div>
  );
};
