import { useEffect, useMemo, useState } from "react";
import {
  Activity,
  AlertCircle,
  ArrowLeft,
  ArrowRight,
  Clock3,
  FileDown,
  FileText,
  RefreshCw,
  Search,
  ShieldCheck,
  Trash2,
  UserCheck,
  UserCog,
  UserPlus,
  UserX,
} from "lucide-react";

import useTheme from "../../hooks/useTheme";
import { getAuditLogs } from "../../api/adminApi";

export default function AuditLogs() {
  const { theme } = useTheme();

  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  // User list search
  const [userSearch, setUserSearch] = useState("");

  // Activity view
  const [selectedUser, setSelectedUser] = useState(null);
  const [activitySearch, setActivitySearch] = useState("");
  const [actionFilter, setActionFilter] = useState("ALL");

  useEffect(() => {
    loadLogs();
  }, []);

  const loadLogs = async () => {
    try {
      setLoading(true);

      const response = await getAuditLogs();

      setLogs(response.data || []);
    } catch (error) {
      console.error(
        "Failed to load audit logs:",
        error
      );
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = async () => {
    try {
      setRefreshing(true);

      const response = await getAuditLogs();

      setLogs(response.data || []);
    } catch (error) {
      console.error(
        "Failed to refresh audit logs:",
        error
      );
    } finally {
      setRefreshing(false);
    }
  };

  const getActionIcon = (action) => {
    if (!action) {
      return <Activity size={17} />;
    }

    if (action.includes("UPLOAD")) {
      return <FileText size={17} />;
    }

    if (action.includes("DOWNLOAD")) {
      return <FileDown size={17} />;
    }

    if (action.includes("DELETE")) {
      return <Trash2 size={17} />;
    }

    if (action.includes("CREATE")) {
      return <UserPlus size={17} />;
    }

    if (action.includes("APPROVE")) {
      return <UserCheck size={17} />;
    }

    if (action.includes("REJECT")) {
      return <UserX size={17} />;
    }

    if (action.includes("UPDATE")) {
      return <UserCog size={17} />;
    }

    if (action.includes("AI_QUERY")) {
      return <ShieldCheck size={17} />;
    }

    return <Activity size={17} />;
  };

  const getActionStyle = (action) => {
    if (!action) {
      return theme === "light"
        ? "bg-gray-100 text-gray-700"
        : "bg-white/10 text-gray-300";
    }

    if (action.includes("UPLOAD")) {
      return theme === "light"
        ? "bg-blue-100 text-blue-700"
        : "bg-blue-900/30 text-blue-400";
    }

    if (action.includes("DOWNLOAD")) {
      return theme === "light"
        ? "bg-green-100 text-green-700"
        : "bg-green-900/30 text-green-400";
    }

    if (action.includes("DELETE")) {
      return theme === "light"
        ? "bg-red-100 text-red-700"
        : "bg-red-900/30 text-red-400";
    }

    if (action.includes("APPROVE")) {
      return theme === "light"
        ? "bg-emerald-100 text-emerald-700"
        : "bg-emerald-900/30 text-emerald-400";
    }

    if (action.includes("REJECT")) {
      return theme === "light"
        ? "bg-orange-100 text-orange-700"
        : "bg-orange-900/30 text-orange-400";
    }

    if (action.includes("CREATE")) {
      return theme === "light"
        ? "bg-purple-100 text-purple-700"
        : "bg-purple-900/30 text-purple-400";
    }

    if (action.includes("AI_QUERY")) {
      return theme === "light"
        ? "bg-indigo-100 text-indigo-700"
        : "bg-indigo-900/30 text-indigo-400";
    }

    if (action.includes("LOGIN")) {
      return theme === "light"
        ? "bg-cyan-100 text-cyan-700"
        : "bg-cyan-900/30 text-cyan-400";
    }

    return theme === "light"
      ? "bg-gray-100 text-gray-700"
      : "bg-white/10 text-gray-300";
  };

  const getActionLabel = (action) => {
    if (!action) {
      return "Unknown";
    }

    return action
      .replaceAll("_", " ")
      .toLowerCase()
      .replace(/\b\w/g, (letter) =>
        letter.toUpperCase()
      );
  };

  const todayLogs = logs.filter((log) => {
    if (!log.timestamp) {
      return false;
    }

    const date = new Date(log.timestamp);
    const today = new Date();

    return (
      date.toDateString() ===
      today.toDateString()
    );
  }).length;

  const aiQueries = logs.filter(
    (log) => log.action === "AI_QUERY"
  ).length;

  const documentActions = logs.filter(
    (log) =>
      log.action?.includes("DOCUMENT") ||
      log.action?.includes("UPLOAD") ||
      log.action?.includes("DOWNLOAD")
  ).length;

  const users = useMemo(() => {
    const userMap = new Map();

    logs.forEach((log) => {
      const userId = String(
        log.user_id ?? "unknown"
      );

      const username =
        log.username ||
        `User #${userId}`;

      if (!userMap.has(userId)) {
        userMap.set(userId, {
          id: userId,
          username,
          logs: [],
        });
      }

      userMap
        .get(userId)
        .logs.push(log);
    });

    return Array.from(
      userMap.values()
    )
      .map((user) => {
        const sortedLogs = [...user.logs].sort(
          (a, b) =>
            new Date(b.timestamp || 0) -
            new Date(a.timestamp || 0)
        );

        return {
          ...user,
          logs: sortedLogs,
          activityCount:
            sortedLogs.length,
          lastActivity:
            sortedLogs[0]?.timestamp || null,
        };
      })
      .sort(
        (a, b) =>
          new Date(b.lastActivity || 0) -
          new Date(a.lastActivity || 0)
      );
  }, [logs]);

  const filteredUsers = useMemo(() => {
    const query = userSearch
      .trim()
      .toLowerCase();

    if (!query) {
      return users;
    }

    return users.filter((user) => {
      return (
        user.username
          .toLowerCase()
          .includes(query) ||
        user.id
          .toLowerCase()
          .includes(query)
      );
    });
  }, [users, userSearch]);

  const actionOptions = useMemo(() => {
    const uniqueActions = [
      ...new Set(
        logs
          .map((log) => log.action)
          .filter(Boolean)
      ),
    ];

    return uniqueActions.sort();
  }, [logs]);

  const selectedUserLogs = useMemo(() => {
    if (!selectedUser) {
      return [];
    }

    const query = activitySearch
      .trim()
      .toLowerCase();

    return selectedUser.logs.filter(
      (log) => {
        const matchesSearch =
          !query ||
          String(log.action || "")
            .toLowerCase()
            .includes(query) ||
          String(log.details || "")
            .toLowerCase()
            .includes(query);

        const matchesAction =
          actionFilter === "ALL" ||
          log.action === actionFilter;

        return (
          matchesSearch &&
          matchesAction
        );
      }
    );
  }, [
    selectedUser,
    activitySearch,
    actionFilter,
  ]);

  if (loading) {
    return (
      <div className="space-y-6">
        <div>
          <div className="h-8 w-56 animate-pulse rounded-lg bg-gray-200 dark:bg-white/10" />

          <div className="mt-3 h-4 w-80 animate-pulse rounded bg-gray-200 dark:bg-white/10" />
        </div>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {[1, 2, 3, 4].map(
            (item) => (
              <div
                key={item}
                className="h-28 animate-pulse rounded-2xl bg-gray-200 dark:bg-white/10"
              />
            )
          )}
        </div>

        <div className="h-96 animate-pulse rounded-2xl bg-gray-200 dark:bg-white/10" />
      </div>
    );
  }

  return (
    <div className="space-y-8">

      {/* HEADER */}

      <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
        <div className="flex items-center gap-3">
          <div
            className={`rounded-xl p-3 ${
              theme === "light"
                ? "bg-blue-100 text-blue-700"
                : "bg-blue-900/30 text-blue-400"
            }`}
          >
            <ShieldCheck size={25} />
          </div>

          <div>
            <h1 className="text-3xl font-bold tracking-tight">
              Audit Logs
            </h1>

            <p
              className={`mt-1 text-sm ${
                theme === "light"
                  ? "text-gray-500"
                  : "text-gray-400"
              }`}
            >
              Monitor user activity and
              security events.
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={handleRefresh}
          disabled={refreshing}
          className="flex w-fit items-center gap-2 rounded-xl bg-blue-600 px-5 py-2.5 font-medium text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
        >
          <RefreshCw
            size={17}
            className={
              refreshing
                ? "animate-spin"
                : ""
            }
          />

          {refreshing
            ? "Refreshing..."
            : "Refresh Logs"}
        </button>
      </div>

      {/* STATISTICS */}

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">

        {/* Total */}
        <div
          className={`rounded-2xl border p-5 ${
            theme === "light"
              ? "border-gray-200 bg-white"
              : "border-white/10 bg-[#171717]"
          }`}
        >
          <div className="flex items-center justify-between">
            <div
              className={`rounded-xl p-3 ${
                theme === "light"
                  ? "bg-blue-100 text-blue-700"
                  : "bg-blue-900/30 text-blue-400"
              }`}
            >
              <Activity size={21} />
            </div>

            <span className="text-xs font-medium text-gray-400">
              TOTAL
            </span>
          </div>

          <p className="mt-4 text-2xl font-bold">
            {logs.length}
          </p>

          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
            Recorded events
          </p>
        </div>

        {/* Today */}
        <div
          className={`rounded-2xl border p-5 ${
            theme === "light"
              ? "border-gray-200 bg-white"
              : "border-white/10 bg-[#171717]"
          }`}
        >
          <div className="flex items-center justify-between">
            <div
              className={`rounded-xl p-3 ${
                theme === "light"
                  ? "bg-green-100 text-green-700"
                  : "bg-green-900/30 text-green-400"
              }`}
            >
              <Clock3 size={21} />
            </div>

            <span className="text-xs font-medium text-green-500">
              TODAY
            </span>
          </div>

          <p className="mt-4 text-2xl font-bold">
            {todayLogs}
          </p>

          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
            Events today
          </p>
        </div>

        {/* AI */}
        <div
          className={`rounded-2xl border p-5 ${
            theme === "light"
              ? "border-gray-200 bg-white"
              : "border-white/10 bg-[#171717]"
          }`}
        >
          <div className="flex items-center justify-between">
            <div
              className={`rounded-xl p-3 ${
                theme === "light"
                  ? "bg-indigo-100 text-indigo-700"
                  : "bg-indigo-900/30 text-indigo-400"
              }`}
            >
              <ShieldCheck size={21} />
            </div>

            <span className="text-xs font-medium text-indigo-500">
              AI
            </span>
          </div>

          <p className="mt-4 text-2xl font-bold">
            {aiQueries}
          </p>

          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
            AI queries
          </p>
        </div>

        {/* Documents */}
        <div
          className={`rounded-2xl border p-5 ${
            theme === "light"
              ? "border-gray-200 bg-white"
              : "border-white/10 bg-[#171717]"
          }`}
        >
          <div className="flex items-center justify-between">
            <div
              className={`rounded-xl p-3 ${
                theme === "light"
                  ? "bg-purple-100 text-purple-700"
                  : "bg-purple-900/30 text-purple-400"
              }`}
            >
              <FileText size={21} />
            </div>

            <span className="text-xs font-medium text-purple-500">
              DOCS
            </span>
          </div>

          <p className="mt-4 text-2xl font-bold">
            {documentActions}
          </p>

          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
            Document events
          </p>
        </div>
      </div>

      {/* USER VIEW */}
      {!selectedUser ? (
        <div
          className={`overflow-hidden rounded-2xl border shadow-sm ${
            theme === "light"
              ? "border-gray-200 bg-white"
              : "border-white/10 bg-[#171717]"
          }`}
        >

          {/* User list header */}
          <div
            className={`border-b p-5 ${
              theme === "light"
                ? "border-gray-200"
                : "border-white/10"
            }`}
          >
            <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">

              <div>
                <h2 className="text-lg font-semibold">
                  User Activity
                </h2>

                <p
                  className={`mt-1 text-sm ${
                    theme === "light"
                      ? "text-gray-500"
                      : "text-gray-400"
                  }`}
                >
                  Select a user to view their
                  complete activity history.
                </p>
              </div>

              <div className="relative w-full lg:w-80">
                <Search
                  size={17}
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
                />

                <input
                  type="text"
                  value={userSearch}
                  onChange={(e) =>
                    setUserSearch(
                      e.target.value
                    )
                  }
                  placeholder="Search users..."
                  className={`w-full rounded-xl border py-2.5 pl-10 pr-4 outline-none focus:ring-2 focus:ring-blue-500/30 ${
                    theme === "light"
                      ? "border-gray-300 bg-white"
                      : "border-white/10 bg-[#1B1B1B]"
                  }`}
                />
              </div>
            </div>
          </div>

          {/* User count */}
          <div
            className={`border-b px-5 py-3 text-xs ${
              theme === "light"
                ? "border-gray-100 text-gray-500"
                : "border-white/10 text-gray-400"
            }`}
          >
            {filteredUsers.length} users
            with recorded activity
          </div>

          {/* Users */}
          {filteredUsers.length === 0 ? (
            <div className="flex flex-col items-center justify-center p-16 text-center">
              <Search
                size={34}
                className="mb-3 text-gray-400"
              />

              <p className="font-medium">
                No users found
              </p>

              <p className="mt-1 text-sm text-gray-500">
                Try another username or user ID.
              </p>
            </div>
          ) : (
            <div>
              {filteredUsers.map(
                (user, index) => (
                  <button
                    key={user.id}
                    type="button"
                    onClick={() => {
                      setSelectedUser(user);
                      setActivitySearch("");
                      setActionFilter("ALL");
                    }}
                    className={`flex w-full items-center gap-4 p-5 text-left transition ${
                      theme === "light"
                        ? "hover:bg-gray-50"
                        : "hover:bg-white/[0.03]"
                    } ${
                      index !==
                      filteredUsers.length - 1
                        ? theme === "light"
                          ? "border-b border-gray-100"
                          : "border-b border-white/10"
                        : ""
                    }`}
                  >

                    {/* Avatar */}
                    <div
                      className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-full ${
                        theme === "light"
                          ? "bg-blue-100 text-blue-700"
                          : "bg-blue-900/30 text-blue-400"
                      }`}
                    >
                      <UserCheck
                        size={21}
                      />
                    </div>

                    {/* User information */}
                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <p className="font-semibold">
                          {user.username}
                        </p>

                        <span
                          className={`rounded-full px-2 py-0.5 text-[10px] ${
                            theme === "light"
                              ? "bg-gray-100 text-gray-500"
                              : "bg-white/10 text-gray-400"
                          }`}
                        >
                          ID: {user.id}
                        </span>
                      </div>

                      <div className="mt-1 flex flex-wrap items-center gap-3 text-xs text-gray-500 dark:text-gray-400">
                        <span>
                          {user.activityCount}{" "}
                          {user.activityCount ===
                          1
                            ? "activity"
                            : "activities"}
                        </span>

                        <span>•</span>

                        <span>
                          Last activity:{" "}
                          {user.lastActivity
                            ? new Date(
                                user.lastActivity
                              ).toLocaleString()
                            : "Unknown"}
                        </span>
                      </div>
                    </div>

                    {/* Arrow */}
                    <div
                      className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-lg ${
                        theme === "light"
                          ? "bg-gray-100 text-gray-500"
                          : "bg-white/10 text-gray-400"
                      }`}
                    >
                      <ArrowRight
                        size={17}
                      />
                    </div>
                  </button>
                )
              )}
            </div>
          )}
        </div>
      ) : (
        //SELECTED USER ACTIVITY
        <div className="space-y-5">

          {/* Back + User Header */}
          <div
            className={`rounded-2xl border p-5 ${
              theme === "light"
                ? "border-gray-200 bg-white"
                : "border-white/10 bg-[#171717]"
            }`}
          >
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">

              <div className="flex items-center gap-4">

                <button
                  type="button"
                  onClick={() => {
                    setSelectedUser(null);
                    setActivitySearch("");
                    setActionFilter("ALL");
                  }}
                  className={`flex h-10 w-10 items-center justify-center rounded-xl transition ${
                    theme === "light"
                      ? "bg-gray-100 text-gray-600 hover:bg-gray-200"
                      : "bg-white/10 text-gray-300 hover:bg-white/15"
                  }`}
                  title="Back to users"
                >
                  <ArrowLeft size={18} />
                </button>

                <div
                  className={`flex h-12 w-12 items-center justify-center rounded-full ${
                    theme === "light"
                      ? "bg-blue-100 text-blue-700"
                      : "bg-blue-900/30 text-blue-400"
                  }`}
                >
                  <UserCheck
                    size={21}
                  />
                </div>

                <div>
                  <h2 className="text-xl font-semibold">
                    {selectedUser.username}
                  </h2>

                  <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                    User ID:{" "}
                    {selectedUser.id}
                    {" • "}
                    {selectedUser.activityCount}{" "}
                    activities
                  </p>
                </div>
              </div>

              <div
                className={`flex items-center gap-2 rounded-full px-3 py-1.5 text-xs font-medium ${
                  theme === "light"
                    ? "bg-green-50 text-green-700"
                    : "bg-green-900/20 text-green-400"
                }`}
              >
                <span className="h-2 w-2 rounded-full bg-green-500" />
                Activity Records
              </div>
            </div>
          </div>

          {/* Activity filters */}
          <div
            className={`rounded-2xl border p-4 ${
              theme === "light"
                ? "border-gray-200 bg-white"
                : "border-white/10 bg-[#171717]"
            }`}
          >
            <div className="flex flex-col gap-3 lg:flex-row">

              <div className="relative flex-1">
                <Search
                  size={18}
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
                />

                <input
                  type="text"
                  value={activitySearch}
                  onChange={(e) =>
                    setActivitySearch(
                      e.target.value
                    )
                  }
                  placeholder="Search this user's activity..."
                  className={`w-full rounded-xl border py-2.5 pl-10 pr-4 outline-none focus:ring-2 focus:ring-blue-500/30 ${
                    theme === "light"
                      ? "border-gray-300 bg-white"
                      : "border-white/10 bg-[#1B1B1B]"
                  }`}
                />
              </div>

              <select
                value={actionFilter}
                onChange={(e) =>
                  setActionFilter(
                    e.target.value
                  )
                }
                className={`rounded-xl border px-4 py-2.5 outline-none ${
                  theme === "light"
                    ? "border-gray-300 bg-white text-black"
                    : "border-white/10 bg-[#1B1B1B] text-white"
                }`}
              >
                <option value="ALL">
                  All Actions
                </option>

                {actionOptions.map(
                  (action) => (
                    <option
                      key={action}
                      value={action}
                    >
                      {getActionLabel(
                        action
                      )}
                    </option>
                  )
                )}
              </select>
            </div>
          </div>

          {/* Activity table */}
          <div
            className={`overflow-hidden rounded-2xl border shadow-sm ${
              theme === "light"
                ? "border-gray-200 bg-white"
                : "border-white/10 bg-[#171717]"
            }`}
          >

            <div
              className={`flex items-center justify-between border-b px-5 py-4 ${
                theme === "light"
                  ? "border-gray-200"
                  : "border-white/10"
              }`}
            >
              <div>
                <h2 className="font-semibold">
                  User Activity
                </h2>

                <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                  {selectedUserLogs.length} of{" "}
                  {selectedUser.activityCount}{" "}
                  events
                </p>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full min-w-[750px]">

                <thead
                  className={
                    theme === "light"
                      ? "bg-gray-50"
                      : "bg-[#1E1E1E]"
                  }
                >
                  <tr>
                    <th className="p-4 text-left text-xs font-semibold uppercase tracking-wider">
                      Action
                    </th>

                    <th className="p-4 text-left text-xs font-semibold uppercase tracking-wider">
                      Details
                    </th>

                    <th className="p-4 text-left text-xs font-semibold uppercase tracking-wider">
                      Timestamp
                    </th>
                  </tr>
                </thead>

                <tbody>
                  {selectedUserLogs.length ===
                  0 ? (
                    <tr>
                      <td
                        colSpan={3}
                        className="p-12 text-center"
                      >
                        <div className="flex flex-col items-center">
                          <Search
                            size={30}
                            className="mb-3 text-gray-400"
                          />

                          <p className="font-medium">
                            No matching activity
                          </p>

                          <p className="mt-1 text-sm text-gray-500">
                            Try changing your
                            search or action
                            filter.
                          </p>
                        </div>
                      </td>
                    </tr>
                  ) : (
                    selectedUserLogs.map(
                      (log) => (
                        <tr
                          key={log.id}
                          className={`border-t transition ${
                            theme === "light"
                              ? "border-gray-100 hover:bg-gray-50"
                              : "border-white/10 hover:bg-white/[0.02]"
                          }`}
                        >

                          {/* Action */}
                          <td className="p-4">
                            <span
                              className={`inline-flex items-center gap-2 rounded-full px-3 py-1.5 text-xs font-medium ${getActionStyle(
                                log.action
                              )}`}
                            >
                              {getActionIcon(
                                log.action
                              )}

                              {getActionLabel(
                                log.action
                              )}
                            </span>
                          </td>

                          {/* Details */}
                          <td className="max-w-xl p-4">
                            <p
                              className="text-sm"
                              title={
                                log.details
                              }
                            >
                              {log.details ||
                                "No details available"}
                            </p>
                          </td>

                          {/* Timestamp */}
                          <td className="p-4">
                            <div className="flex items-center gap-2">
                              <Clock3
                                size={15}
                                className="text-gray-400"
                              />

                              <span className="whitespace-nowrap text-sm text-gray-600 dark:text-gray-400">
                                {log.timestamp
                                  ? new Date(
                                      log.timestamp
                                    ).toLocaleString()
                                  : "Unknown"}
                              </span>
                            </div>
                          </td>
                        </tr>
                      )
                    )
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}