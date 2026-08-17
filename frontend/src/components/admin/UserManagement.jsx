import { useEffect, useState } from "react";
import useTheme from "../../hooks/useTheme";
import { getUsers, updateUser, deleteUser } from "../../api/adminApi";

export default function UserManagement() {
  const { theme } = useTheme();
  const [users, setUsers] = useState([]);

  const loadUsers = async () => {
    try {
      const response = await getUsers();
      setUsers(response.data);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    loadUsers();
  }, []);

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this user?")) return;

    try {
      await deleteUser(id);
      loadUsers();
    } catch (err) {
      alert(err.response?.data?.detail || "Delete failed");
    }
  };

  const handleUpdate = async (user) => {
    try {
      await updateUser(user.id, {
        role: user.role,
        clearance: user.clearance,
        status: user.status,
      });

      alert("User updated successfully");
    } catch (err) {
      alert(err.response?.data?.detail || "Update failed");
    }
  };

  return (
    <div>
      <h1 className="mb-6 text-3xl font-bold">User Management</h1>

      <div
        className={`overflow-hidden rounded-xl border ${
          theme === "light" ? "border-gray-200" : "border-white/10"
        }`}
      >
        <table className="w-full">
          <thead className={theme === "light" ? "bg-gray-100" : "bg-[#171717]"}>
            <tr>
              <th className="p-4 text-left">Username</th>
              <th className="p-4 text-left">Email</th>
              <th className="p-4 text-left">Role</th>
              <th className="p-4 text-left">Clearance</th>
              <th className="p-4 text-left">Status</th>
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

                <td className="p-4">
                  <select
                    className={`rounded-md border px-2 py-1 outline-none ${
                      theme === "light"
                        ? "border-gray-300 bg-white text-black"
                        : "border-gray-600 bg-[#1B1B1B] text-white"
                    }`}
                  >
                    <option className="bg-[#1B1B1B] text-white" value="User">
                      User
                    </option>
                    <option className="bg-[#1B1B1B] text-white" value="Admin">
                      Admin
                    </option>
                  </select>
                </td>

                <td className="p-4">
                  <select
                    className={`rounded-md border px-2 py-1 outline-none ${
                      theme === "light"
                        ? "border-gray-300 bg-white text-black"
                        : "border-gray-600 bg-[#1B1B1B] text-white"
                    }`}
                  >
                    <option className="bg-[#1B1B1B] text-white" value="Public">
                      Public
                    </option>
                    <option
                      className="bg-[#1B1B1B] text-white"
                      value="Confidential"
                    >
                      Confidential
                    </option>
                    <option className="bg-[#1B1B1B] text-white" value="Secret">
                      Secret
                    </option>
                  </select>
                </td>

                <td className="p-4">
                  <select
                    className={`rounded-md border px-2 py-1 outline-none ${
                      theme === "light"
                        ? "border-gray-300 bg-white text-black"
                        : "border-gray-600 bg-[#1B1B1B] text-white"
                    }`}
                  >
                    <option
                      className="bg-[#1B1B1B] text-white"
                      value="Approved"
                    >
                      Approved
                    </option>
                    <option className="bg-[#1B1B1B] text-white" value="Pending">
                      Pending
                    </option>
                    <option
                      className="bg-[#1B1B1B] text-white"
                      value="Rejected"
                    >
                      Rejected
                    </option>
                  </select>
                </td>

                <td className="p-4">
                  <div className="flex justify-center gap-2">
                    <button
                      onClick={() => handleUpdate(user)}
                      className="rounded bg-blue-600 px-4 py-2 text-white"
                    >
                      Save
                    </button>

                    <button
                      disabled={user.role === "Admin"}
                      onClick={() => handleDelete(user.id)}
                      className={`rounded px-4 py-2 text-white ${
                        user.role === "Admin"
                          ? "cursor-not-allowed bg-gray-500"
                          : "bg-red-600 hover:bg-red-700"
                      }`}
                    >
                      Delete
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
