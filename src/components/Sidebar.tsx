import React from "react";
import { NavLink } from "react-router-dom";
import { HomeIcon, BookOpenIcon, ChartBarIcon, CogIcon } from "@heroicons/react/24/outline";

export const Sidebar: React.FC = () => {
  const links = [
    { to: "/", label: "Trang chủ", icon: <HomeIcon className="w-5 h-5" /> },
    { to: "/learn", label: "Chế độ học", icon: <BookOpenIcon className="w-5 h-5" /> },
    { to: "/statistics", label: "Thống kê", icon: <ChartBarIcon className="w-5 h-5" /> },
    { to: "/settings", label: "Cài đặt", icon: <CogIcon className="w-5 h-5" /> },
  ];

  return (
    <aside className="w-64 bg-white dark:bg-gray-800 shadow-md flex flex-col">
      <div className="p-6 text-xl font-bold text-gray-800 dark:text-gray-100">
        Học Từ vựng
      </div>
      <nav className="flex-1 flex flex-col">
        {links.map((link) => (
          <NavLink
            key={link.to}
            to={link.to}
            className={({ isActive }) =>
              `flex items-center gap-3 px-6 py-3 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 ${
                isActive ? "bg-gray-200 dark:bg-gray-700 font-semibold" : ""
              }`
            }
          >
            {link.icon}
            <span>{link.label}</span>
          </NavLink>
        ))}
      </nav>
    </aside>
  );
};
