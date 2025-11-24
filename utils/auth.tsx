// src/utils/auth.tsx
import React from "react";
import { useNavigate } from "react-router-dom";

export type Role = "admin" | "staff" | "student";

export type User = {
  id: string;
  name: string;
  role: Role;
  email?: string;
};

type AuthContextType = {
  user: User | null;
  isAuthenticated: boolean;
  login: (role: Role, payload?: { email?: string; password?: string }) => Promise<User>;
  logout: () => void;
};

const AuthContext = React.createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = React.useState<User | null>(() => {
    try {
      const raw = localStorage.getItem("__user");
      return raw ? (JSON.parse(raw) as User) : null;
    } catch {
      return null;
    }
  });

  const navigate = useNavigate();

  const login = async (role: Role, _payload?: { email?: string }) => {
    // DEV: fake login. Replace with real API call to backend:
    // const res = await apiClient.post('/auth/login', { ... })
    const fake: User = {
      id: `${role}_1`,
      name: `${role.charAt(0).toUpperCase() + role.slice(1)} User`,
      role,
      email: _payload?.email || `${role}@example.com`,
    };
    // save token & user
    localStorage.setItem("token", "dev-token");
    localStorage.setItem("__user", JSON.stringify(fake));
    setUser(fake);
    // redirect to dashboard
    navigate(`/${role}/dashboard`);
    return fake;
  };

  const logout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("__user");
    setUser(null);
    navigate("/");
  };

  return (
    <AuthContext.Provider value={{ user, isAuthenticated: Boolean(user), login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export function useAuth() {
  const ctx = React.useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}

/** ProtectedRoute: wrapper you can use in router */
import { Navigate } from "react-router-dom";

export function ProtectedRoute({
  children,
  role,
}: {
  children: JSX.Element;
  role?: Role;
}) {
  const { isAuthenticated, user } = useAuth();
  if (!isAuthenticated) return <Navigate to={`/${role || "student"}/login`} replace />;
  if (role && user?.role !== role) return <Navigate to={`/${user?.role}/dashboard`} replace />;
  return children;
}
