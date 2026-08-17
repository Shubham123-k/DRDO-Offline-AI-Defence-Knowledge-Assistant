import {LayoutDashboard, UserPlus, Users, FileText, ClipboardList, Settings, LogOut } from "lucide-react";
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
];

export default function AdminSidebar({ page, setPage }) {
  const { theme } = useTheme();

  return (
    <aside
      className={`w-72 border-r transition-colors duration-300 ${
        theme === "light"
          ? "bg-gray-50 border-r border-gray-200"
          : "bg-[#111111] border-r border-white/10"
      }`}
    >
      <div className="border-b border-inherit p-6">
        <h1 className="text-2xl font-bold">DRDO</h1>

        <p
          className={`mt-1 text-sm ${
            theme === "light" ? "text-gray-500" : "text-gray-400"
          }`}
        >
          Admin Panel
        </p>
      </div>

      <nav className="mt-4 flex flex-col gap-2 px-3">
        {menuItems.map((item) => {
          const Icon = item.icon;

          return (
            <button
              key={item.id}
              onClick={() => setPage(item.id)}
              className={`flex w-full items-center gap-3 rounded-xl px-4 py-3 text-left transition ${
                page === item.id
                  ? "bg-blue-600 text-white"
                  : theme === "light"
                    ? "hover:bg-gray-100"
                    : "hover:bg-[#1f1f1f]"
              }`}
            >
              <Icon size={20} />
              <span>{item.label}</span>
            </button>
          );
        })}
      </nav>

      <div className="absolute bottom-6 left-0 w-72 px-3">
        <button
          className={`flex w-full items-center gap-3 rounded-xl px-4 py-3 transition ${
            theme === "light"
              ? "hover:bg-red-50 hover:text-red-600"
              : "hover:bg-red-900/20 hover:text-red-400"
          }`}
        >
          <LogOut size={20} />
          Logout
        </button>
      </div>
    </aside>
  );
}
