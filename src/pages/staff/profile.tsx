// src/pages/staff/profile.tsx
import React from "react";
import { StaffLayout } from "../../layouts/StaffLayout";

export const StaffProfile: React.FC = () => {
  return (
    <StaffLayout>
      <h1 className="text-xl font-semibold mb-4">My Profile</h1>
      <div className="bg-white p-4 rounded shadow">Profile details and edit</div>
    </StaffLayout>
  );
};
