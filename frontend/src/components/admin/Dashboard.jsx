import { useEffect, useState } from "react";
import useTheme from "../../hooks/useTheme";
import { getDashboardStats } from "../../api/adminApi";

import { Users, UserCheck, Shield, FileText, Clock, Activity, CheckCircle2, AlertCircle } from "lucide-react";

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
      description: "Registered system users",
      icon: Users,
      iconBg:
        theme === "light"
          ? "bg-blue-100"
          : "bg-blue-500/10",
      iconColor:
        theme === "light"
          ? "text-blue-600"
          : "text-blue-400",
    },
    {
      title: "Pending Users",
      value: stats.pending_users,
      description: "Awaiting approval",
      icon: UserCheck,
      iconBg:
        theme === "light"
          ? "bg-yellow-100"
          : "bg-yellow-500/10",
      iconColor:
        theme === "light"
          ? "text-yellow-600"
          : "text-yellow-400",
    },
    {
      title: "Total Documents",
      value: stats.total_documents,
      description: "Classified documents",
      icon: FileText,
      iconBg:
        theme === "light"
          ? "bg-green-100"
          : "bg-green-500/10",
      iconColor:
        theme === "light"
          ? "text-green-600"
          : "text-green-400",
    },
    {
      title: "Audit Logs",
      value: stats.audit_logs,
      description: "Security activity records",
      icon: Shield,
      iconBg:
        theme === "light"
          ? "bg-purple-100"
          : "bg-purple-500/10",
      iconColor:
        theme === "light"
          ? "text-purple-600"
          : "text-purple-400",
    },
  ];

  if (loading) {
    return (
      <div className="flex min-h-[400px] items-center justify-center">
        <div className="text-center">
          <div
            className={`mx-auto mb-4 h-10 w-10 animate-spin rounded-full border-4 border-t-transparent ${
              theme === "light"
                ? "border-gray-300"
                : "border-white/20"
            }`}
          />

          <p
            className={
              theme === "light"
                ? "text-gray-500"
                : "text-gray-400"
            }
          >
            Loading dashboard...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">

      {/* Header */}
      <div
        className={`relative overflow-hidden rounded-2xl border p-7 ${
          theme === "light"
            ? "border-gray-200 bg-white"
            : "border-white/10 bg-[#171717]"
        }`}
      >
        {/* Decorative background */}
        <div
          className={`absolute -right-16 -top-20 h-52 w-52 rounded-full blur-3xl ${
            theme === "light"
              ? "bg-blue-100"
              : "bg-blue-500/10"
          }`}
        />

        <div className="relative flex items-center gap-4">
          <div
            className={`flex h-14 w-14 items-center justify-center rounded-2xl ${
              theme === "light"
                ? "bg-blue-100 text-blue-600"
                : "bg-blue-500/10 text-blue-400"
            }`}
          >
            <Shield size={28} />
          </div>

          <div>
            <h1 className="text-3xl font-bold tracking-tight">
              Dashboard
            </h1>

            <p
              className={`mt-1 text-sm ${
                theme === "light"
                  ? "text-gray-500"
                  : "text-gray-400"
              }`}
            >
              Welcome to the DRDO Administration Panel.
            </p>
          </div>
        </div>
      </div>

      {/* Statistics Cards */}
      <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-4">
        {cards.map((card) => {
          const Icon = card.icon;

          return (
            <div
              key={card.title}
              className={`group relative overflow-hidden rounded-2xl border p-6 transition-all duration-300 hover:-translate-y-1 hover:shadow-lg ${
                theme === "light"
                  ? "border-gray-200 bg-white hover:border-gray-300"
                  : "border-white/10 bg-[#171717] hover:border-white/20"
              }`}
            >
              {/* Top accent */}
              <div
                className={`absolute left-0 right-0 top-0 h-1 ${
                  card.iconColor
                }`}
              />

              <div className="flex items-start justify-between">
                <div>
                  <p
                    className={`text-sm font-medium ${
                      theme === "light"
                        ? "text-gray-500"
                        : "text-gray-400"
                    }`}
                  >
                    {card.title}
                  </p>

                  <h2 className="mt-3 text-4xl font-bold tracking-tight">
                    {card.value}
                  </h2>

                  <p
                    className={`mt-2 text-xs ${
                      theme === "light"
                        ? "text-gray-400"
                        : "text-gray-500"
                    }`}
                  >
                    {card.description}
                  </p>
                </div>

                <div
                  className={`flex h-12 w-12 items-center justify-center rounded-xl transition-transform duration-300 group-hover:scale-110 ${card.iconBg} ${card.iconColor}`}
                >
                  <Icon size={23} />
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* System Overview */}
      <div className="grid gap-6 lg:grid-cols-2">

        {/* Security Status */}
        <div
          className={`rounded-2xl border p-6 ${
            theme === "light"
              ? "border-gray-200 bg-white"
              : "border-white/10 bg-[#171717]"
          }`}
        >
          <div className="mb-6 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div
                className={`flex h-10 w-10 items-center justify-center rounded-xl ${
                  theme === "light"
                    ? "bg-green-100 text-green-600"
                    : "bg-green-500/10 text-green-400"
                }`}
              >
                <Activity size={20} />
              </div>

              <div>
                <h2 className="font-semibold">
                  System Status
                </h2>

                <p
                  className={`text-xs ${
                    theme === "light"
                      ? "text-gray-500"
                      : "text-gray-400"
                  }`}
                >
                  Current platform overview
                </p>
              </div>
            </div>

            <span
              className={`flex items-center gap-2 rounded-full px-3 py-1.5 text-xs font-medium ${
                theme === "light"
                  ? "bg-green-100 text-green-700"
                  : "bg-green-500/10 text-green-400"
              }`}
            >
              <span className="h-2 w-2 rounded-full bg-green-500" />
              Operational
            </span>
          </div>

          <div className="space-y-4">

            <div
              className={`flex items-center justify-between rounded-xl p-4 ${
                theme === "light"
                  ? "bg-gray-50"
                  : "bg-[#1D1D1D]"
              }`}
            >
              <div className="flex items-center gap-3">
                <CheckCircle2
                  size={19}
                  className={
                    theme === "light"
                      ? "text-green-600"
                      : "text-green-400"
                  }
                />

                <span className="text-sm">
                  Authentication
                </span>
              </div>

              <span className="text-xs font-medium text-green-500">
                Active
              </span>
            </div>

            <div
              className={`flex items-center justify-between rounded-xl p-4 ${
                theme === "light"
                  ? "bg-gray-50"
                  : "bg-[#1D1D1D]"
              }`}
            >
              <div className="flex items-center gap-3">
                <CheckCircle2
                  size={19}
                  className={
                    theme === "light"
                      ? "text-green-600"
                      : "text-green-400"
                  }
                />

                <span className="text-sm">
                  Document Management
                </span>
              </div>

              <span className="text-xs font-medium text-green-500">
                Active
              </span>
            </div>

            <div
              className={`flex items-center justify-between rounded-xl p-4 ${
                theme === "light"
                  ? "bg-gray-50"
                  : "bg-[#1D1D1D]"
              }`}
            >
              <div className="flex items-center gap-3">
                <CheckCircle2
                  size={19}
                  className={
                    theme === "light"
                      ? "text-green-600"
                      : "text-green-400"
                  }
                />

                <span className="text-sm">
                  Audit Monitoring
                </span>
              </div>

              <span className="text-xs font-medium text-green-500">
                Active
              </span>
            </div>

          </div>
        </div>

        {/* Activity Summary */}
        <div
          className={`rounded-2xl border p-6 ${
            theme === "light"
              ? "border-gray-200 bg-white"
              : "border-white/10 bg-[#171717]"
          }`}
        >
          <div className="mb-6 flex items-center gap-3">
            <div
              className={`flex h-10 w-10 items-center justify-center rounded-xl ${
                theme === "light"
                  ? "bg-blue-100 text-blue-600"
                  : "bg-blue-500/10 text-blue-400"
              }`}
            >
              <Clock size={20} />
            </div>

            <div>
              <h2 className="font-semibold">
                Activity Summary
              </h2>

              <p
                className={`text-xs ${
                  theme === "light"
                    ? "text-gray-500"
                    : "text-gray-400"
                }`}
              >
                Administration activity
              </p>
            </div>
          </div>

          <div className="space-y-4">

            <div
              className={`flex items-center justify-between rounded-xl p-4 ${
                theme === "light"
                  ? "bg-gray-50"
                  : "bg-[#1D1D1D]"
              }`}
            >
              <div className="flex items-center gap-3">
                <Users size={18} />

                <span className="text-sm">
                  Registered Users
                </span>
              </div>

              <span className="font-semibold">
                {stats.total_users}
              </span>
            </div>

            <div
              className={`flex items-center justify-between rounded-xl p-4 ${
                theme === "light"
                  ? "bg-gray-50"
                  : "bg-[#1D1D1D]"
              }`}
            >
              <div className="flex items-center gap-3">
                <AlertCircle
                  size={18}
                  className={
                    stats.pending_users > 0
                      ? "text-yellow-500"
                      : ""
                  }
                />

                <span className="text-sm">
                  Pending Approvals
                </span>
              </div>

              <span
                className={`font-semibold ${
                  stats.pending_users > 0
                    ? "text-yellow-500"
                    : ""
                }`}
              >
                {stats.pending_users}
              </span>
            </div>

            <div
              className={`flex items-center justify-between rounded-xl p-4 ${
                theme === "light"
                  ? "bg-gray-50"
                  : "bg-[#1D1D1D]"
              }`}
            >
              <div className="flex items-center gap-3">
                <FileText size={18} />

                <span className="text-sm">
                  Indexed Documents
                </span>
              </div>

              <span className="font-semibold">
                {stats.total_documents}
              </span>
            </div>

            <div
              className={`flex items-center justify-between rounded-xl p-4 ${
                theme === "light"
                  ? "bg-gray-50"
                  : "bg-[#1D1D1D]"
              }`}
            >
              <div className="flex items-center gap-3">
                <Shield size={18} />

                <span className="text-sm">
                  Security Records
                </span>
              </div>

              <span className="font-semibold">
                {stats.audit_logs}
              </span>
            </div>

          </div>
        </div>

      </div>
    </div>
  );
}