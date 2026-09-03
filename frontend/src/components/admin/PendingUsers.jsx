import { useEffect, useState } from "react";
import { Check, X, Clock3, Mail, Shield, UserRound, UsersRound } from "lucide-react";
import useTheme from "../../hooks/useTheme";

import { getPendingUsers, approveUser, rejectUser } from "../../api/adminApi";

export default function PendingUsers() {
  const { theme } = useTheme();

  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [processingId, setProcessingId] = useState(null);

  useEffect(() => {
    loadPendingUsers();
  }, []);

  const loadPendingUsers = async () => {
    try {
      setLoading(true);

      const response = await getPendingUsers();

      setUsers(response.data);
    } catch (error) {
      console.error(
        "Failed to load pending users:",
        error
      );
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (id) => {
    try {
      setProcessingId(id);

      await approveUser(id);

      await loadPendingUsers();
    } catch (error) {
      console.error(
        "Failed to approve user:",
        error
      );
    } finally {
      setProcessingId(null);
    }
  };

  const handleReject = async (id) => {
    try {
      setProcessingId(id);

      await rejectUser(id);

      await loadPendingUsers();
    } catch (error) {
      console.error(
        "Failed to reject user:",
        error
      );
    } finally {
      setProcessingId(null);
    }
  };

  const getClearanceStyle = (clearance) => {
    if (clearance === "Secret") {
      return theme === "light"
        ? "bg-red-50 text-red-700 border-red-200"
        : "bg-red-500/10 text-red-400 border-red-500/20";
    }

    if (clearance === "Confidential") {
      return theme === "light"
        ? "bg-yellow-50 text-yellow-700 border-yellow-200"
        : "bg-yellow-500/10 text-yellow-400 border-yellow-500/20";
    }

    return theme === "light"
      ? "bg-green-50 text-green-700 border-green-200"
      : "bg-green-500/10 text-green-400 border-green-500/20";
  };

  if (loading) {
    return (
      <div className="space-y-8">
        <div>
          <div
            className={`h-9 w-56 animate-pulse rounded-lg ${
              theme === "light"
                ? "bg-gray-200"
                : "bg-white/10"
            }`}
          />

          <div
            className={`mt-3 h-5 w-80 animate-pulse rounded ${
              theme === "light"
                ? "bg-gray-100"
                : "bg-white/5"
            }`}
          />
        </div>

        <div
          className={`overflow-hidden rounded-2xl border ${
            theme === "light"
              ? "border-gray-200 bg-white"
              : "border-white/10 bg-[#171717]"
          }`}
        >
          <div className="space-y-4 p-6">
            {[1, 2, 3].map((item) => (
              <div
                key={item}
                className={`h-16 animate-pulse rounded-xl ${
                  theme === "light"
                    ? "bg-gray-100"
                    : "bg-white/5"
                }`}
              />
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">

      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">

        <div>
          <div className="flex items-center gap-3">
            <div
              className={`flex h-11 w-11 items-center justify-center rounded-xl ${
                theme === "light"
                  ? "bg-blue-50 text-blue-600"
                  : "bg-blue-500/10 text-blue-400"
              }`}
            >
              <UsersRound size={22} />
            </div>

            <div>
              <h1 className="text-3xl font-bold tracking-tight">
                Pending Users
              </h1>

              <p
                className={`mt-1 text-sm ${
                  theme === "light"
                    ? "text-gray-500"
                    : "text-gray-400"
                }`}
              >
                Review and manage access requests.
              </p>
            </div>
          </div>
        </div>

        {/* Pending count */}
        <div
          className={`flex w-fit items-center gap-2 rounded-full border px-4 py-2 text-sm font-medium ${
            theme === "light"
              ? "border-orange-200 bg-orange-50 text-orange-700"
              : "border-orange-500/20 bg-orange-500/10 text-orange-400"
          }`}
        >
          <Clock3 size={16} />

          {users.length}{" "}
          {users.length === 1
            ? "request"
            : "requests"}{" "}
          pending
        </div>
      </div>

      {/* Main Card */}
      <div
        className={`overflow-hidden rounded-2xl border shadow-sm ${
          theme === "light"
            ? "border-gray-200 bg-white"
            : "border-white/10 bg-[#171717]"
        }`}
      >

        {/* Card Header */}
        <div
          className={`flex items-center justify-between border-b px-6 py-5 ${
            theme === "light"
              ? "border-gray-200 bg-gray-50/70"
              : "border-white/10 bg-[#1A1A1A]"
          }`}
        >
          <div>
            <h2 className="font-semibold">
              Access Requests
            </h2>

            <p
              className={`mt-1 text-sm ${
                theme === "light"
                  ? "text-gray-500"
                  : "text-gray-400"
              }`}
            >
              Users waiting for administrator approval.
            </p>
          </div>

          <div
            className={`flex h-10 w-10 items-center justify-center rounded-full ${
              theme === "light"
                ? "bg-blue-50 text-blue-600"
                : "bg-blue-500/10 text-blue-400"
            }`}
          >
            <Shield size={19} />
          </div>
        </div>

        {/* Empty State */}
        {users.length === 0 ? (
          <div className="flex flex-col items-center justify-center px-6 py-20 text-center">

            <div
              className={`mb-5 flex h-16 w-16 items-center justify-center rounded-2xl ${
                theme === "light"
                  ? "bg-green-50 text-green-600"
                  : "bg-green-500/10 text-green-400"
              }`}
            >
              <Check size={30} />
            </div>

            <h3 className="text-lg font-semibold">
              All caught up
            </h3>

            <p
              className={`mt-2 max-w-md text-sm ${
                theme === "light"
                  ? "text-gray-500"
                  : "text-gray-400"
              }`}
            >
              There are currently no users waiting
              for access approval.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">

            <table className="w-full min-w-[760px]">

              <thead
                className={
                  theme === "light"
                    ? "bg-gray-50"
                    : "bg-[#1E1E1E]"
                }
              >
                <tr>
                  <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider">
                    User
                  </th>

                  <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider">
                    Email
                  </th>

                  <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider">
                    Requested Access
                  </th>

                  <th className="px-6 py-4 text-center text-xs font-semibold uppercase tracking-wider">
                    Status
                  </th>

                  <th className="px-6 py-4 text-right text-xs font-semibold uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>

              <tbody>
                {users.map((user) => (
                  <tr
                    key={user.id}
                    className={`border-t transition ${
                      theme === "light"
                        ? "border-gray-100 hover:bg-gray-50"
                        : "border-white/10 hover:bg-white/[0.025]"
                    }`}
                  >

                    {/* User */}
                    <td className="px-6 py-5">
                      <div className="flex items-center gap-3">

                        <div
                          className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full ${
                            theme === "light"
                              ? "bg-blue-50 text-blue-600"
                              : "bg-blue-500/10 text-blue-400"
                          }`}
                        >
                          <UserRound size={18} />
                        </div>

                        <div>
                          <p className="font-medium">
                            {user.username}
                          </p>

                          <p
                            className={`mt-0.5 text-xs ${
                              theme === "light"
                                ? "text-gray-400"
                                : "text-gray-500"
                            }`}
                          >
                            User ID #{user.id}
                          </p>
                        </div>

                      </div>
                    </td>

                    {/* Email */}
                    <td className="px-6 py-5">
                      <div
                        className={`flex items-center gap-2 text-sm ${
                          theme === "light"
                            ? "text-gray-600"
                            : "text-gray-300"
                        }`}
                      >
                        <Mail size={15} />

                        {user.email}
                      </div>
                    </td>

                    {/* Clearance */}
                    <td className="px-6 py-5">
                      <span
                        className={`inline-flex items-center gap-2 rounded-full border px-3 py-1.5 text-xs font-semibold ${getClearanceStyle(
                          user.clearance
                        )}`}
                      >
                        <Shield size={13} />

                        {user.clearance}
                      </span>
                    </td>

                    {/* Status */}
                    <td className="px-6 py-5 text-center">
                      <span
                        className={`inline-flex items-center gap-2 rounded-full px-3 py-1.5 text-xs font-medium ${
                          theme === "light"
                            ? "bg-orange-50 text-orange-700"
                            : "bg-orange-500/10 text-orange-400"
                        }`}
                      >
                        <span className="h-1.5 w-1.5 rounded-full bg-current" />

                        Pending
                      </span>
                    </td>

                    {/* Actions */}
                    <td className="px-6 py-5">
                      <div className="flex justify-end gap-2">

                        <button
                          type="button"
                          disabled={
                            processingId === user.id
                          }
                          onClick={() =>
                            handleApprove(user.id)
                          }
                          className="inline-flex items-center gap-2 rounded-lg bg-green-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-green-700 disabled:cursor-not-allowed disabled:opacity-50"
                        >
                          <Check size={16} />

                          {processingId === user.id
                            ? "Processing..."
                            : "Approve"}
                        </button>

                        <button
                          type="button"
                          disabled={
                            processingId === user.id
                          }
                          onClick={() =>
                            handleReject(user.id)
                          }
                          className="inline-flex items-center gap-2 rounded-lg bg-red-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-50"
                        >
                          <X size={16} />

                          Reject
                        </button>

                      </div>
                    </td>

                  </tr>
                ))}
              </tbody>

            </table>
          </div>
        )}
      </div>
    </div>
  );
}