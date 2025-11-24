// src/components/tables/SimpleTable.tsx
import React from "react";

export function SimpleTable<T extends Record<string, any>>({ columns, data }: { columns: string[]; data: T[] }) {
  return (
    <div className="overflow-x-auto bg-white rounded shadow">
      <table className="min-w-full">
        <thead className="bg-slate-100">
          <tr>
            {columns.map((c) => (
              <th key={c} className="p-2 text-left text-sm font-medium">{c}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {data.map((row, i) => (
            <tr key={i} className="border-t">
              {columns.map((c) => (
                <td key={c} className="p-2 text-sm">{String(row[c] ?? "")}</td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
