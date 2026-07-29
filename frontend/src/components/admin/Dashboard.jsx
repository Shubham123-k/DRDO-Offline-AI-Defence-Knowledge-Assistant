import { useEffect, useState } from "react";
import useTheme from "../../hooks/useTheme";
import { getDashboardStats } from "../../api/adminApi";
import {
  Users,
  UserCheck,
  Shield,
  FileText,
} from "lucide-react";



export default function Dashboard() {
  const { theme } = useTheme();
  const [stats, setStats] = useState({
  total_users: 0,
  pending_users: 0,
  total_documents: 0,
  audit_logs: 0,
});

const [loading, setLoading] = useState(true);

useEffect(() => {
  loadDashboard();
}, []);

const loadDashboard = async () => {
  try {
    setLoading(true);

    const response = await getDashboardStats();

    setStats(response.data);
  } catch (error) {
    console.error("Dashboard error:", error);
  } finally {
    setLoading(false);
  }
};

const cards = [
  {
    title: "Total Users",
    value: stats.total_users,
    icon: Users,
  },
  {
    title: "Pending Users",
    value: stats.pending_users,
    icon: UserCheck,
  },
  {
    title: "Total Documents",
    value: stats.total_documents,
    icon: FileText,
  },
  {
    title: "Audit Logs",
    value: stats.audit_logs,
    icon: Shield,
  },
];

if (loading) {
  return (
    <div className="py-10 text-center">
      Loading dashboard...
    </div>
  );
}

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold">
          Dashboard
        </h1>

        <p
          className={`mt-2 ${
            theme === "light"
              ? "text-gray-500"
              : "text-gray-400"
          }`}
        >
          Welcome to the DRDO Administration Panel.
        </p>
      </div>

      <div className="grid gap-6 sm:grid-cols-2 xl:grid-cols-4">
        {cards.map((card) => {
          const Icon = card.icon;

          return (
            <div
              key={card.title}
              className={`rounded-2xl border p-6 shadow-sm transition ${
                theme === "light"
                  ? "border-gray-200 bg-white"
                  : "border-white/10 bg-[#171717]"
              }`}
            >
              <div className="flex items-center justify-between">
                <div>
                  <p
                    className={`text-sm ${
                      theme === "light"
                        ? "text-gray-500"
                        : "text-gray-400"
                    }`}
                  >
                    {card.title}
                  </p>

                  <h2 className="mt-3 text-4xl font-bold">
                    {card.value}
                  </h2>
                </div>

                <Icon size={36} />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}