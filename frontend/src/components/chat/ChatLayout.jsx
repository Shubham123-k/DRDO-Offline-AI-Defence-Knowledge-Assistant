import Sidebar from "./Sidebar";
import ChatWindow from "./ChatWindow";
import useTheme from "../../hooks/useTheme";

export default function ChatLayout() {
  const { theme } = useTheme();

  return (
    <div
      className={`flex h-screen overflow-hidden transition-colors duration-300 ${
        theme === "light"
          ? "bg-white text-black"
          : "bg-[#0B0B0B] text-white"
      }`}
    >
      <Sidebar />
      <main className="flex min-h-0 flex-1 flex-col">
        <ChatWindow />
      </main>
    </div>
  );
}