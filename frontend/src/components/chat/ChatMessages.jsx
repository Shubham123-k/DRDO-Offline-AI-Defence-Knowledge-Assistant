import { useEffect, useRef } from "react";
import { MessageSquare } from "lucide-react";

import { useChat } from "../../context/ChatContext";
import MessageBubble from "./MessageBubble";
import TypingIndicator from "./TypingIndicator";
import useTheme from "../../hooks/useTheme";

export default function ChatMessages() {
  const {
    activeChat,
    isTyping,
  } = useChat();

  const { theme } = useTheme();

  const bottomRef = useRef(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({
      behavior: "smooth",
    });
  }, [
    activeChat?.messages?.length,
    isTyping,
  ]);

  if (!activeChat) {
    return (
      <div
        className={`flex h-full w-full items-center justify-center ${
          theme === "light"
            ? "bg-[#f8fafc]"
            : "bg-[#0B0B0B]"
        }`}
      >
        <div className="flex flex-col items-center text-center">
          <div
            className={`mb-4 flex h-14 w-14 items-center justify-center rounded-2xl border ${
              theme === "light"
                ? "border-gray-200 bg-white text-gray-400"
                : "border-white/10 bg-[#171717] text-gray-500"
            }`}
          >
            <MessageSquare size={25} />
          </div>

          <p
            className={`text-sm ${
              theme === "light"
                ? "text-gray-500"
                : "text-gray-400"
            }`}
          >
            Select a conversation to begin
          </p>
        </div>
      </div>
    );
  }

  const messages =
    activeChat.messages || [];

  return (
    <div
      className={`relative flex h-full w-full min-h-0 flex-col overflow-y-auto scroll-smooth px-4 py-6 sm:px-6 lg:px-8 ${
        theme === "light"
          ? "bg-[#f8fafc]"
          : "bg-[#0B0B0B]"
      }`}
    >
      {/* Subtle background decoration */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div
          className={`absolute left-1/2 top-0 h-72 w-72 -translate-x-1/2 rounded-full blur-3xl ${
            theme === "light"
              ? "bg-blue-50/70"
              : "bg-blue-950/10"
          }`}
        />
      </div>

      {/* Message Content */}
      <div className="relative mx-auto flex w-full max-w-5xl flex-1 flex-col">
        {messages.length === 0 ? (
          <div className="flex flex-1 items-center justify-center px-4">
            <div className="flex max-w-md flex-col items-center text-center">

              <div
                className={`mb-5 flex h-16 w-16 items-center justify-center rounded-2xl border shadow-sm ${
                  theme === "light"
                    ? "border-gray-200 bg-white text-blue-600"
                    : "border-white/10 bg-[#171717] text-blue-400"
                }`}
              >
                <MessageSquare size={28} />
              </div>

              <h2 className="text-xl font-semibold">
                Start a conversation
              </h2>

              <p
                className={`mt-2 text-sm leading-6 ${
                  theme === "light"
                    ? "text-gray-500"
                    : "text-gray-400"
                }`}
              >
                Ask the DRDO AI Assistant about
                your authorized defence knowledge
                and documents.
              </p>

              <div
                className={`mt-5 rounded-xl border px-4 py-3 text-xs ${
                  theme === "light"
                    ? "border-gray-200 bg-white text-gray-400"
                    : "border-white/10 bg-[#171717] text-gray-500"
                }`}
              >
                🔒 Responses are limited by your
                access clearance.
              </div>
            </div>
          </div>
        ) : (
          <div className="flex flex-col gap-5 pb-6">
            {messages.map((message) => (
              <MessageBubble
                key={message.id}
                message={message}
              />
            ))}

            {isTyping && (
              <div className="animate-in fade-in duration-200">
                <TypingIndicator />
              </div>
            )}

            <div ref={bottomRef} />
          </div>
        )}
      </div>
    </div>
  );
}