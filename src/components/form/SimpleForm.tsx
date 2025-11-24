// src/components/forms/SimpleForm.tsx
import React from "react";

export const SimpleForm: React.FC<{ onSubmit?: (data: any) => void; children?: React.ReactNode }> = ({
  onSubmit,
  children,
}) => {
  const handle = (e: React.FormEvent) => {
    e.preventDefault();
    // if you want to serialize, you can implement form data extraction here
    onSubmit && onSubmit({});
  };
  return (
    <form onSubmit={handle} className="space-y-3">
      {children}
    </form>
  );
};
