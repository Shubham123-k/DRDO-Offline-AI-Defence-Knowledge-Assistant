import { useEffect, useState } from "react";
import useTheme from "../../hooks/useTheme";
import { getAllUsers, updateUser, deleteUser } from "../../api/adminApi";

import { Users, Shield, ShieldCheck, Clock, UserCog, Save, Trash2, Search, Mail, CheckCircle2, XCircle, AlertCircle } from "lucide-react";

export default function UserManagement() {
  const { theme } = useTheme();

  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [savingId, setSavingId] = useState(null);
  const [deletingId, setDeletingId] = useState(null);

  useEffect(() => {
    loadUsers();
  }, []);

  const loadUsers = async () => {
    try {
      setLoading(true);

      const response = await getAllUsers();

      setUsers(response.data);
    } catch (error) {
      console.error("Failed to load users:", error);
    } finally {
      setLoading(false);
    }
  };

  const updateLocalUser = (id, field, value) => {
    setUsers((prev) =>
      prev.map((user) =>
        user.id === id
          ? {
              ...user,
              [field]: value,
            }
          : user
      )
    );
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this user?")) {
      return;
    }

    try {
      setDeletingId(id);

      await deleteUser(id);

      await loadUsers();
    } catch (error) {
      alert(
        error?.response?.data?.detail ||
          "Delete failed."
      );
    } finally {
      setDeletingId(null);
    }
  };

  const handleUpdate = async (user) => {
    try {
      setSavingId(user.id);

      await updateUser(user.id, {
        role: user.role,
        clearance: user.clearance,
        status: user.status,
      });

      alert("User updated successfully.");

      await loadUsers();
    } catch (error) {
      alert(
        error?.response?.data?.detail ||
          "Update failed."
      );
    } finally {
      setSavingId(null);
    }
  };

  const filteredUsers = users.filter((user) => {
    const query = search.toLowerCase();

    return (
      user.username?.toLowerCase().includes(query) ||
      user.email?.toLowerCase().includes(query) ||
      user.role?.toLowerCase().includes(query) ||
      user.clearance?.toLowerCase().includes(query) ||
      user.status?.toLowerCase().includes(query)
    );
  });

  const totalUsers = users.length;

  const adminUsers = users.filter(
    (user) =>
      user.role?.toLowerCase() === "admin"
  ).length;

  const approvedUsers = users.filter(
    (user) =>
      user.status?.toLowerCase() === "approved"
  ).length;

  const pendingUsers = users.filter(
    (user) =>
      user.status?.toLowerCase() === "pending"
  ).length;

  const getStatusStyle = (status) => {
    switch (status) {
      case "Approved":
        return theme === "light"
          ? "bg-green-100 text-green-700 border-green-200"
          : "bg-green-500/10 text-green-400 border-green-500/20";

      case "Pending":
        return theme === "light"
          ? "bg-yellow-100 text-yellow-700 border-yellow-200"
          : "bg-yellow-500/10 text-yellow-400 border-yellow-500/20";

      case "Rejected":
        return theme === "light"
          ? "bg-red-100 text-red-700 border-red-200"
          : "bg-red-500/10 text-red-400 border-red-500/20";

      default:
        return theme === "light"
          ? "bg-gray-100 text-gray-600 border-gray-200"
          : "bg-white/5 text-gray-400 border-white/10";
    }
  };

  const getClearanceStyle = (clearance) => {
    switch (clearance) {
      case "Secret":
        return theme === "light"
          ? "bg-red-100 text-red-700 border-red-200"
          : "bg-red-500/10 text-red-400 border-red-500/20";

      case "Confidential":
        return theme === "light"
          ? "bg-yellow-100 text-yellow-700 border-yellow-200"
          : "bg-yellow-500/10 text-yellow-400 border-yellow-500/20";

      default:
        return theme === "light"
          ? "bg-green-100 text-green-700 border-green-200"
          : "bg-green-500/10 text-green-400 border-green-500/20";
    }
  };

  const getStatusIcon = (status) => {
    if (status === "Approved") {
      return <CheckCircle2 size={14} />;
    }

    if (status === "Rejected") {
      return <XCircle size={14} />;
    }

    return <AlertCircle size={14} />;
  };

  if (loading) {
    return (
      <div className="flex min-h-[400px] items-center justify-center">
        <div className="text-center">
          <div className="mx-auto mb-4 h-10 w-10 animate-spin rounded-full border-4 border-blue-500/20 border-t-blue-500" />

          <p
            className={
              theme === "light"
                ? "text-gray-500"
                : "text-gray-400"
            }
          >
            Loading users...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">

      {/* Header */}
      <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">

        <div>
          <div className="flex items-center gap-3">
            <div
              className={`flex h-11 w-11 items-center justify-center rounded-xl ${
                theme === "light"
                  ? "bg-blue-100 text-blue-600"
                  : "bg-blue-500/10 text-blue-400"
              }`}
            >
              <UserCog size={23} />
            </div>

            <div>
              <h1 className="text-3xl font-bold tracking-tight">
                User Management
              </h1>

              <p
                className={`mt-1 text-sm ${
                  theme === "light"
                    ? "text-gray-500"
                    : "text-gray-400"
                }`}
              >
                Manage users, roles, clearance levels and account status.
              </p>
            </div>
          </div>
        </div>

        {/* Search */}
        <div className="relative w-full lg:w-80">
          <Search
            size={18}
            className={`absolute left-3 top-1/2 -translate-y-1/2 ${
              theme === "light"
                ? "text-gray-400"
                : "text-gray-500"
            }`}
          />

          <input
            type="text"
            value={search}
            onChange={(e) =>
              setSearch(e.target.value)
            }
            placeholder="Search users..."
            className={`w-full rounded-xl border py-3 pl-10 pr-4 text-sm outline-none transition focus:ring-2 focus:ring-blue-500/30 ${
              theme === "light"
                ? "border-gray-200 bg-white text-gray-900 placeholder:text-gray-400"
                : "border-white/10 bg-[#171717] text-white placeholder:text-gray-500"
            }`}
          />
        </div>
      </div>

      {/* Statistics */}
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">

        {/* Total */}
        <div
          className={`group rounded-2xl border p-5 transition hover:-translate-y-0.5 hover:shadow-lg ${
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
                Total Users
              </p>

              <p className="mt-2 text-3xl font-bold">
                {totalUsers}
              </p>
            </div>

            <div
              className={`rounded-xl p-3 ${
                theme === "light"
                  ? "bg-blue-100 text-blue-600"
                  : "bg-blue-500/10 text-blue-400"
              }`}
            >
              <Users size={21} />
            </div>
          </div>
        </div>

        {/* Admins */}
        <div
          className={`group rounded-2xl border p-5 transition hover:-translate-y-0.5 hover:shadow-lg ${
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
                Administrators
              </p>

              <p className="mt-2 text-3xl font-bold">
                {adminUsers}
              </p>
            </div>

            <div
              className={`rounded-xl p-3 ${
                theme === "light"
                  ? "bg-purple-100 text-purple-600"
                  : "bg-purple-500/10 text-purple-400"
              }`}
            >
              <Shield size={21} />
            </div>
          </div>
        </div>

        {/* Approved */}
        <div
          className={`group rounded-2xl border p-5 transition hover:-translate-y-0.5 hover:shadow-lg ${
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
                Approved
              </p>

              <p className="mt-2 text-3xl font-bold">
                {approvedUsers}
              </p>
            </div>

            <div
              className={`rounded-xl p-3 ${
                theme === "light"
                  ? "bg-green-100 text-green-600"
                  : "bg-green-500/10 text-green-400"
              }`}
            >
              <ShieldCheck size={21} />
            </div>
          </div>
        </div>

        {/* Pending */}
        <div
          className={`group rounded-2xl border p-5 transition hover:-translate-y-0.5 hover:shadow-lg ${
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
                Pending
              </p>

              <p className="mt-2 text-3xl font-bold">
                {pendingUsers}
              </p>
            </div>

            <div
              className={`rounded-xl p-3 ${
                theme === "light"
                  ? "bg-yellow-100 text-yellow-600"
                  : "bg-yellow-500/10 text-yellow-400"
              }`}
            >
              <Clock size={21} />
            </div>
          </div>
        </div>
      </div>

      {/* Main table */}
      <div
        className={`overflow-hidden rounded-2xl border shadow-sm ${
          theme === "light"
            ? "border-gray-200 bg-white"
            : "border-white/10 bg-[#171717]"
        }`}
      >

        {/* Table header */}
        <div
          className={`flex items-center justify-between border-b px-5 py-4 ${
            theme === "light"
              ? "border-gray-200"
              : "border-white/10"
          }`}
        >
          <div>
            <h2 className="font-semibold">
              Registered Users
            </h2>

            <p
              className={`mt-1 text-xs ${
                theme === "light"
                  ? "text-gray-500"
                  : "text-gray-500"
              }`}
            >
              {filteredUsers.length} user
              {filteredUsers.length !== 1
                ? "s"
                : ""}{" "}
              displayed
            </p>
          </div>

          <div
            className={`hidden items-center gap-2 rounded-lg px-3 py-2 text-xs sm:flex ${
              theme === "light"
                ? "bg-gray-100 text-gray-500"
                : "bg-white/5 text-gray-400"
            }`}
          >
            <Shield size={14} />
            Access Controlled
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full min-w-[1050px]">

            <thead
              className={
                theme === "light"
                  ? "bg-gray-50"
                  : "bg-[#1D1D1D]"
              }
            >
              <tr>

                <th className="px-5 py-4 text-left text-xs font-semibold uppercase tracking-wider">
                  User
                </th>

                <th className="px-5 py-4 text-left text-xs font-semibold uppercase tracking-wider">
                  Role
                </th>

                <th className="px-5 py-4 text-left text-xs font-semibold uppercase tracking-wider">
                  Clearance
                </th>

                <th className="px-5 py-4 text-left text-xs font-semibold uppercase tracking-wider">
                  Status
                </th>

                <th className="px-5 py-4 text-center text-xs font-semibold uppercase tracking-wider">
                  Actions
                </th>

              </tr>
            </thead>

            <tbody>
              {filteredUsers.map((user) => (
                <tr
                  key={user.id}
                  className={`border-t transition ${
                    theme === "light"
                      ? "border-gray-100 hover:bg-gray-50"
                      : "border-white/5 hover:bg-white/[0.025]"
                  }`}
                >

                  {/* User */}
                  <td className="px-5 py-4">

                    <div className="flex items-center gap-3">

                      <div
                        className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-sm font-bold ${
                          theme === "light"
                            ? "bg-blue-100 text-blue-700"
                            : "bg-blue-500/10 text-blue-400"
                        }`}
                      >
                        {user.username
                          ?.charAt(0)
                          ?.toUpperCase()}
                      </div>

                      <div className="min-w-0">

                        <p className="font-medium">
                          {user.username}
                        </p>

                        <div
                          className={`mt-1 flex items-center gap-1.5 text-xs ${
                            theme === "light"
                              ? "text-gray-500"
                              : "text-gray-500"
                          }`}
                        >
                          <Mail size={12} />

                          <span>
                            {user.email}
                          </span>
                        </div>
                      </div>
                    </div>

                  </td>

                  {/* Role */}
                  <td className="px-5 py-4">

                    <select
                      value={user.role}
                      onChange={(e) =>
                        updateLocalUser(
                          user.id,
                          "role",
                          e.target.value
                        )
                      }
                      className={`rounded-lg border px-3 py-2 text-sm font-medium outline-none transition focus:ring-2 focus:ring-blue-500/30 ${
                        theme === "light"
                          ? "border-gray-200 bg-white text-gray-800"
                          : "border-white/10 bg-[#202020] text-white"
                      }`}
                    >
                      <option value="User">
                        User
                      </option>

                      <option value="Admin">
                        Admin
                      </option>
                    </select>

                  </td>

                  {/* Clearance */}
                  <td className="px-5 py-4">

                    <div className="flex items-center gap-2">

                      <Shield
                        size={15}
                        className={
                          user.clearance === "Secret"
                            ? "text-red-500"
                            : user.clearance ===
                              "Confidential"
                            ? "text-yellow-500"
                            : "text-green-500"
                        }
                      />

                      <select
                        value={user.clearance}
                        onChange={(e) =>
                          updateLocalUser(
                            user.id,
                            "clearance",
                            e.target.value
                          )
                        }
                        className={`rounded-lg border px-3 py-2 text-sm font-medium outline-none transition focus:ring-2 focus:ring-blue-500/30 ${
                          theme === "light"
                            ? "border-gray-200 bg-white text-gray-800"
                            : "border-white/10 bg-[#202020] text-white"
                        }`}
                      >
                        <option value="Public">
                          Public
                        </option>

                        <option value="Confidential">
                          Confidential
                        </option>

                        <option value="Secret">
                          Secret
                        </option>
                      </select>

                    </div>
                  </td>

                  {/* Status */}
                  <td className="px-5 py-4">

                    <div className="flex items-center gap-2">

                      <select
                        value={user.status}
                        onChange={(e) =>
                          updateLocalUser(
                            user.id,
                            "status",
                            e.target.value
                          )
                        }
                        className={`rounded-lg border px-3 py-2 text-sm font-medium outline-none transition focus:ring-2 focus:ring-blue-500/30 ${
                          theme === "light"
                            ? "border-gray-200 bg-white text-gray-800"
                            : "border-white/10 bg-[#202020] text-white"
                        }`}
                      >
                        <option value="Approved">
                          Approved
                        </option>

                        <option value="Pending">
                          Pending
                        </option>

                        <option value="Rejected">
                          Rejected
                        </option>
                      </select>

                      <span
                        className={`hidden items-center gap-1 rounded-full border px-2.5 py-1 text-xs font-medium xl:flex ${getStatusStyle(
                          user.status
                        )}`}
                      >
                        {getStatusIcon(
                          user.status
                        )}

                        {user.status}
                      </span>
                    </div>
                  </td>

                  {/* Actions */}
                  <td className="px-5 py-4">

                    <div className="flex justify-center gap-2">

                      <button
                        onClick={() =>
                          handleUpdate(user)
                        }
                        disabled={
                          savingId === user.id
                        }
                        className="flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
                      >
                        {savingId ===
                        user.id ? (
                          <div className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
                        ) : (
                          <Save size={15} />
                        )}

                        {savingId ===
                        user.id
                          ? "Saving..."
                          : "Save"}
                      </button>

                      <button
                        disabled={
                          user.role === "Admin" ||
                          deletingId === user.id
                        }
                        onClick={() =>
                          handleDelete(user.id)
                        }
                        title={
                          user.role === "Admin"
                            ? "Administrators cannot be deleted"
                            : "Delete user"
                        }
                        className={`flex items-center justify-center rounded-lg p-2 transition ${
                          user.role === "Admin"
                            ? theme === "light"
                              ? "cursor-not-allowed bg-gray-100 text-gray-400"
                              : "cursor-not-allowed bg-white/5 text-gray-600"
                            : "bg-red-600 text-white hover:bg-red-700"
                        }`}
                      >
                        {deletingId ===
                        user.id ? (
                          <div className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
                        ) : (
                          <Trash2 size={17} />
                        )}
                      </button>
                    </div>
                  </td>
                </tr>
              ))}

              {/* Empty state */}
              {filteredUsers.length === 0 && (
                <tr>
                  <td
                    colSpan={5}
                    className="px-5 py-16 text-center"
                  >
                    <div className="flex flex-col items-center">

                      <div
                        className={`mb-4 flex h-14 w-14 items-center justify-center rounded-full ${
                          theme === "light"
                            ? "bg-gray-100 text-gray-400"
                            : "bg-white/5 text-gray-500"
                        }`}
                      >
                        <Users size={25} />
                      </div>

                      <h3 className="font-semibold">
                        {search
                          ? "No users found"
                          : "No users available"}
                      </h3>

                      <p
                        className={`mt-1 text-sm ${
                          theme === "light"
                            ? "text-gray-500"
                            : "text-gray-500"
                        }`}
                      >
                        {search
                          ? "Try adjusting your search."
                          : "There are currently no registered users."}
                      </p>

                    </div>
                  </td>
                </tr>
              )}

            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}