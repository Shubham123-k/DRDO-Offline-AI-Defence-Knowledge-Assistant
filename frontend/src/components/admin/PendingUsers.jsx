import { useEffect, useState } from "react";
import useTheme from "../../hooks/useTheme";

import {
  getPendingUsers,
  approveUser,
  rejectUser,
} from "../../api/adminApi";

export default function PendingUsers() {
  const { theme } = useTheme();

  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
  loadPendingUsers();
}, []);

const loadPendingUsers = async () => {
  try {
    setLoading(true);

    const response = await getPendingUsers();

    setUsers(response.data);
  } catch (error) {
    console.error("Failed to load pending users:", error);
  } finally {
    setLoading(false);
  }
};

const handleApprove = async (id) => {
  try {
    await approveUser(id);

    await loadPendingUsers();
  } catch (error) {
    console.error(error);
  }
};

const handleReject = async (id) => {
  try {
    await rejectUser(id);

    await loadPendingUsers();
  } catch (error) {
    console.error(error);
  }
};

if (loading) {
  return (
    <div className="text-center py-10">
      Loading pending users...
    </div>
  );
}

  return (
    <div>
      <h1 className="mb-6 text-3xl font-bold">Pending Users</h1>

      <div
        className={`overflow-hidden rounded-xl border ${
          theme === "light"
            ? "border-gray-200"
            : "border-white/10"
        }`}
      >
        <table className="w-full">
          <thead
            className={
              theme === "light"
                ? "bg-gray-100"
                : "bg-[#171717]"
            }
          >
            <tr>
              <th className="p-4 text-left">Username</th>
              <th className="p-4 text-left">Email</th>
              <th className="p-4 text-left">Requested Access</th>
              <th className="p-4 text-center">Actions</th>
            </tr>
          </thead>

          <tbody>
            {users.map((user) => (
              <tr
                key={user.id}
                className="border-t border-gray-200 dark:border-white/10"
              >
                <td className="p-4">{user.username}</td>
                <td className="p-4">{user.email}</td>
                <td className="p-4">{user.clearance}</td>

                <td className="p-4">
                  <div className="flex justify-center gap-3">
                    <button onClick={() => handleApprove(user.id)}
                    className="rounded-lg bg-green-600 px-4 py-2 text-white">
                      Approve
                    </button>

                    <button onClick={() => handleReject(user.id)}
                    className="rounded-lg bg-red-600 px-4 py-2 text-white">
                      Reject
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}