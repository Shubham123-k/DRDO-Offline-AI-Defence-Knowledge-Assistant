import { LayoutDashboard, UserPlus, Users, ShieldPlus, ShieldAlert, FileText, ClipboardList, Settings, LogOut } from "lucide-react";

import { useNavigate } from "react-router-dom";
import useTheme from "../../hooks/useTheme";

const menuItems = [
  {
    id: "dashboard",
    label: "Dashboard",
    icon: LayoutDashboard,
  },
  {
    id: "pending",
    label: "Pending Users",
    icon: UserPlus,
  },
  {
    id: "users",
    label: "User Management",
    icon: Users,
  },
  {
    id: "documents",
    label: "Documents",
    icon: FileText,
  },
  {
    id: "logs",
    label: "Audit Logs",
    icon: ClipboardList,
  },
  {
    id: "settings",
    label: "Settings",
    icon: Settings,
  },
  {
    id: "secure-users",
    label: "Secure Users",
    icon: ShieldPlus,
  },
  {
    id: "secure-details",
    label: "Secure Details",
    icon: ShieldAlert,
  },
];

export default function AdminSidebar({
  page,
  setPage,
}) {
  const { theme } = useTheme();

  const navigate = useNavigate();

  const handleLogout = () => {
    // Remove authentication information
    localStorage.removeItem("token");
    localStorage.removeItem("user");

    // Redirect to sign-in page
    navigate("/signin", {
      replace: true,
    });
  };

  return (
    <aside
      className={`relative flex h-screen w-72 shrink-0 flex-col border-r transition-colors duration-300 ${
        theme === "light"
          ? "border-gray-200 bg-gray-50"
          : "border-white/10 bg-[#111111]"
      }`}
    >
      {/* Header */}
      <div className="border-b border-inherit p-6">
        <h1 className="text-2xl font-bold">
          DRDO
        </h1>

        <p
          className={`mt-1 text-sm ${
            theme === "light"
              ? "text-gray-500"
              : "text-gray-400"
          }`}
        >
          Admin Panel
        </p>
      </div>

      {/* Navigation */}
      <nav className="mt-4 flex flex-1 flex-col gap-2 px-3">
        {menuItems.map((item) => {
          const Icon = item.icon;

          return (
            <button
              key={item.id}
              type="button"
              onClick={() =>
                setPage(item.id)
              }
              className={`flex w-full items-center gap-3 rounded-xl px-4 py-3 text-left transition ${
                page === item.id
                  ? "bg-blue-600 text-white shadow-sm"
                  : theme === "light"
                    ? "text-gray-800 hover:bg-gray-100"
                    : "text-gray-200 hover:bg-[#1f1f1f]"
              }`}
            >
              <Icon size={20} />

              <span>
                {item.label}
              </span>
            </button>
          );
        })}
      </nav>

      {/* Logout */}
      <div className="px-3 pb-6">
        <button
          type="button"
          onClick={handleLogout}
          className={`flex w-full items-center gap-3 rounded-xl px-4 py-3 text-left transition hover:cursor-pointer ${
            theme === "light"
              ? "text-gray-800 hover:bg-red-50 hover:text-red-600"
              : "text-gray-200 hover:bg-red-900/20 hover:text-red-400"
          }`}
        >
          <LogOut size={20} />

          <span>Logout</span>
        </button>
      </div>
    </aside>
  );
}