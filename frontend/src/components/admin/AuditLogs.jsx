import { useEffect, useState } from "react";
import useTheme from "../../hooks/useTheme";
import { getAuditLogs } from "../../api/adminApi";

export default function AuditLogs() {
  const { theme } = useTheme();
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadLogs();
  }, []);

  const loadLogs = async () => {
    try {
      setLoading(true);

      const response = await getAuditLogs();

      setLogs(response.data);
    } catch (error) {
      console.error("Failed to load audit logs:", error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="py-10 text-center">Loading audit logs...</div>;
  }

  return (
    <div>
      <h1 className="mb-6 text-3xl font-bold">Audit Logs</h1>

      <div
        className={`overflow-hidden rounded-xl border ${
          theme === "light" ? "border-gray-200" : "border-white/10"
        }`}
      >
        <table className="w-full">
          <thead className={theme === "light" ? "bg-gray-100" : "bg-[#171717]"}>
            <tr>
              <th className="p-4 text-left">User</th>
              <th className="p-4 text-left">Action</th>
              <th className="p-4 text-left">Details</th>
              <th className="p-4 text-left">Time</th>
            </tr>
          </thead>

          <tbody>
            {logs.length === 0 ? (
              <tr>
                <td colSpan={4} className="p-6 text-center">
                  No audit logs available.
                </td>
              </tr>
            ) : (
              logs.map((log) => (
                <tr
                  key={log.id}
                  className="border-t border-gray-200 dark:border-white/10"
                >
                  <td className="p-4">{log.user_id}</td>

                  <td className="p-4">{log.action}</td>

                  <td className="p-4">{log.details}</td>

                  <td className="p-4">
                    {new Date(log.timestamp).toLocaleString()}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
