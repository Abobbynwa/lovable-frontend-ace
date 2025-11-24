// src/pages/admin/login.tsx
import React from "react";
import { useAuth } from "../../utils/auth";

export const AdminLogin: React.FC = () => {
  const { login } = useAuth();
  const [email, setEmail] = React.useState("");
  const [pw, setPw] = React.useState("");

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    await login("admin", { email, password: pw });
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50">
      <div className="w-full max-w-md p-6 bg-white rounded shadow">
        <h2 className="text-xl font-semibold mb-4">Admin Login</h2>
        <form onSubmit={submit} className="space-y-3">
          <input value={email} onChange={(e) => setEmail(e.target.value)} required placeholder="Email" className="w-full p-2 border rounded" />
          <input value={pw} onChange={(e) => setPw(e.target.value)} required type="password" placeholder="Password" className="w-full p-2 border rounded" />
          <button className="w-full p-2 rounded bg-blue-600 text-white">Login</button>
        </form>
      </div>
    </div>
  );
};
