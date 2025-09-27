import React, { ReactNode } from "react";
import { Sidebar } from "./Sidebar";

interface ShellProps {
  children: ReactNode;
}

export const Shell: React.FC<ShellProps> = ({ children }) => {
  return (
    <div className="flex min-h-screen">
      {/* Sidebar bên trái */}
      <Sidebar />

      {/* Khu vực content chính */}
      <main className="flex-1 p-6 bg-gray-50 dark:bg-gray-900">{children}</main>
    </div>
  );
};
