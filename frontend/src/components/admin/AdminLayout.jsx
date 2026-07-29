import { useState } from "react";
import AdminSidebar from "./AdminSidebar";
import AdminHeader from "./AdminHeader";
import Dashboard from "./Dashboard";
import PendingUsers from "./PendingUsers";
import UserManagement from "./UserManagement";
import Documents from "./Documents";
import AuditLogs from "./AuditLogs";
import Settings from "../../pages/Settings";
import useTheme from "../../hooks/useTheme";

export default function AdminLayout() {
  const { theme } = useTheme();

  const [page, setPage] = useState("dashboard");

  const renderPage = () => {
    switch (page) {
      case "dashboard":
        return <Dashboard />;

      case "pending":
        return <PendingUsers />;

      case "users":
        return <UserManagement />;

      case "documents":
        return <Documents />;

      case "logs":
        return <AuditLogs />;

      case "settings":
        return <Settings />;

      default:
        return <Dashboard />;
    }
  };

  return (
    <div
      className={`flex h-screen ${
        theme === "light" ? "bg-white text-black" : "bg-[#0B0B0B] text-white"
      }`}
    >
      <AdminSidebar page={page} setPage={setPage} />

      <div className="flex flex-1 flex-col">
        <AdminHeader />

        <main className="flex-1 overflow-y-auto p-8">{renderPage()}</main>
      </div>
    </div>
  );
}
