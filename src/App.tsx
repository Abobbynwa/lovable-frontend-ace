import { BrowserRouter, Routes, Route } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { TooltipProvider } from "@/components/ui/tooltip";

import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";

import { AuthProvider } from "@/contexts/AuthContext";
import ProtectedRoute from "@/components/ProtectedRoute";

import DashboardLayout from "@/components/layout/DashboardLayout";

import Index from "./pages/Index";
import Login from "./pages/Login";
import SignUp from "./pages/SignUp";

import AdminLogin from "./pages/AdminLogin";
import StaffLogin from "./pages/StaffLogin";
import StudentLogin from "./pages/StudentLogin";

import { AdminDashboard } from "./pages/admin/AdminDashboard";
import ParentDashboard from "./pages/parent/ParentDashboard";
import StudentDashboard from "./pages/student/StudentDashboard";

import Dashboard from "./pages/Dashboard";
import Students from "./pages/Students";
import StudentProfile from "./pages/StudentProfile";
import Attendance from "./pages/Attendance";
import Results from "./pages/Results";
import Profile from "./pages/Profile";
import VerifyEmail from "./pages/VerifyEmail";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Sonner />

        <AuthProvider>
          <BrowserRouter>
            <Routes>
              {/* Public Routes */}
              <Route path="/" element={<Index />} />
              <Route path="/login" element={<Login />} />
              <Route path="/signup" element={<SignUp />} />

              <Route path="/admin-login" element={<AdminLogin />} />
              <Route path="/staff-login" element={<StaffLogin />} />
              <Route path="/student-login" element={<StudentLogin />} />
              <Route path="/verify" element={<VerifyEmail />} />

              {/* Protected Routes */}
              <Route
                path="/"
                element={
                  <ProtectedRoute>
                    <DashboardLayout />
                  </ProtectedRoute>
                }
              >
                <Route path="dashboard" element={<Dashboard />} />

                <Route path="admin" element={<AdminDashboard />} />
                <Route path="parent" element={<ParentDashboard />} />
                <Route path="student" element={<StudentDashboard />} />

                <Route path="students" element={<Students />} />
                <Route path="students/:id" element={<StudentProfile />} />
                <Route path="attendance" element={<Attendance />} />
                <Route path="results" element={<Results />} />
                <Route path="profile" element={<Profile />} />
              </Route>

              <Route path="*" element={<NotFound />} />
            </Routes>
          </BrowserRouter>
        </AuthProvider>

      </TooltipProvider>
    </QueryClientProvider>
  );
};

export default App;
