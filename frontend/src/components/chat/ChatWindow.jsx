import { useChat } from "../../context/ChatContext";
import useTheme from "../../hooks/useTheme";

import ChatHeader from "./ChatHeader";
import WelcomeScreen from "./WelcomeScreen";
import ChatMessages from "./ChatMessages";
import ChatInput from "./ChatInput";

export default function ChatWindow() {
  const { theme } = useTheme();
  const { activeChat } = useChat();

  const hasMessages =
    activeChat &&
    activeChat.messages &&
    activeChat.messages.length > 0;

  return (
    <div
      className={`relative flex h-full min-h-0 flex-1 flex-col overflow-hidden transition-colors duration-300 ${
        theme === "light"
          ? "bg-[#fafafa] text-gray-900"
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
          className={`absolute -right-32 -top-32 h-96 w-96 rounded-full blur-3xl ${
            theme === "light"
              ? "bg-blue-100"
              : "bg-blue-950"
          }`}
        />

        <div
          className={`absolute -bottom-40 -left-40 h-96 w-96 rounded-full blur-3xl ${
            theme === "light"
              ? "bg-gray-100"
              : "bg-white/[0.02]"
          }`}
        />
      </div>

      {/* Header */}
      <div className="relative z-20 shrink-0">
        <ChatHeader />
      </div>

      {/* Chat content */}
      <main className="relative z-10 flex min-h-0 flex-1 overflow-hidden">
        <div className="flex min-h-0 w-full flex-1 flex-col">
          {hasMessages ? (
            <ChatMessages />
          ) : (
            <div className="flex min-h-0 flex-1 items-center justify-center">
              <WelcomeScreen />
            </div>
          )}
        </div>
      </main>

      {/* Input */}
      <div className="relative z-20 shrink-0">
        <ChatInput />
      </div>
    </div>
  );
}