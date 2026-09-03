import Sidebar from "./Sidebar";
import ChatWindow from "./ChatWindow";
import useTheme from "../../hooks/useTheme";

export default function ChatLayout() {
  const { theme } = useTheme();

  return (
    <div
      className={`relative flex h-screen w-full overflow-hidden transition-colors duration-300 ${
        theme === "light"
          ? "bg-[#f8fafc] text-gray-900"
          : "bg-[#0B0B0B] text-white"
      }`}
    >
      {/* Subtle background glow */}
      <div
        className={`pointer-events-none absolute inset-0 overflow-hidden ${
          theme === "light"
            ? "opacity-40"
            : "opacity-20"
        }`}
      >
        <div
          className={`absolute -left-32 -top-32 h-96 w-96 rounded-full blur-3xl ${
            theme === "light"
              ? "bg-blue-100"
              : "bg-blue-950"
          }`}
        />

        <div
          className={`absolute -bottom-40 -right-40 h-96 w-96 rounded-full blur-3xl ${
            theme === "light"
              ? "bg-indigo-100"
              : "bg-indigo-950"
          }`}
        />
      </div>

      {/* Sidebar */}
      <div className="relative z-10 shrink-0">
        <Sidebar />
      </div>

      {/* Main Chat Area */}
      <main className="relative z-10 flex min-h-0 min-w-0 flex-1 flex-col">
        <ChatWindow />
      </main>
    </div>
  );
}