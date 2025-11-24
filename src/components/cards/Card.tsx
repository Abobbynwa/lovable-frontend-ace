// src/components/cards/Card.tsx
import React from "react";

export const Card: React.FC<{ title?: string; children?: React.ReactNode }> = ({ title, children }) => {
  return (
    <div className="bg-white rounded shadow p-4">
      {title && <div className="font-semibold mb-2">{title}</div>}
      {children}
    </div>
  );
};
