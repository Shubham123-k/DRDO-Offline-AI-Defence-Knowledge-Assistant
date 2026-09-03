import { useState } from "react";

import useTheme from "../../hooks/useTheme";
import SidebarHeader from "./SidebarHeader";
import ProfileMenu from "./ProfileMenu";
import { useChat } from "../../context/ChatContext";
import SidebarItem from "./SidebarItem";

import { Plus, Pin, MessageSquare, Shield } from "lucide-react";

export default function Sidebar() {
  const { theme } = useTheme();

  const {
    chats,
    activeChat,
    createNewChat,
  } = useChat();

  const [collapsed, setCollapsed] =
    useState(false);

  const pinnedChats = chats.filter(
    (chat) => chat.pinned
  );

  const recentChats = chats.filter(
    (chat) => !chat.pinned
  );

  const isLight = theme === "light";

  return (
    <aside
      className={`relative flex h-screen shrink-0 flex-col border-r transition-[width] duration-300 ease-in-out ${
        collapsed
          ? "w-[76px]"
          : "w-[280px]"
      } ${
        isLight
          ? "border-gray-200 bg-[#f8f9fa]"
          : "border-white/[0.08] bg-[#101112]"
      }`}
    >
      {/* SIDEBAR HEADER */}
      <SidebarHeader
        collapsed={collapsed}
        onToggle={() =>
          setCollapsed((prev) => !prev)
        }
      />

      {/* EXPANDED SIDEBAR CONTENT */}
      <div
        className={`flex min-h-0 flex-1 flex-col overflow-hidden transition-opacity duration-200 ${
          collapsed
            ? "pointer-events-none opacity-0"
            : "opacity-100"
        }`}
      >
        <div className="flex-1 overflow-y-auto px-3 py-4">

          {/* NEW CHAT */}
          <button
            onClick={createNewChat}
            className={`group mb-6 flex w-full items-center gap-3 rounded-xl border px-4 py-3.5 text-left transition-all duration-200 ${
              isLight
                ? "border-gray-200 bg-white text-gray-800 shadow-sm hover:border-gray-300 hover:bg-gray-50 hover:shadow"
                : "border-white/[0.08] bg-[#191a1b] text-gray-100 hover:border-white/[0.14] hover:bg-[#202122]"
            }`}
          >
            <div
              className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-lg transition ${
                isLight
                  ? "bg-gray-100 text-gray-700 group-hover:bg-gray-200"
                  : "bg-white/[0.07] text-gray-200 group-hover:bg-white/[0.12]"
              }`}
            >
              <Plus
                size={18}
                strokeWidth={2.2}
              />
            </div>

            <div className="min-w-0 flex-1">
              <p className="text-sm font-semibold">
                New Chat
              </p>

              <p
                className={`mt-0.5 text-[11px] ${
                  isLight
                    ? "text-gray-400"
                    : "text-gray-500"
                }`}
              >
                Start a new conversation
              </p>
            </div>
          </button>

          {/* PINNED */}
          <section className="mb-7">
            <div className="mb-2 flex items-center gap-2 px-2">
              <Pin
                size={13}
                className="text-gray-500"
              />

              <h3 className="text-[11px] font-semibold uppercase tracking-wider text-gray-500">
                Pinned
              </h3>

              {pinnedChats.length > 0 && (
                <span
                  className={`ml-auto rounded-full px-2 py-0.5 text-[10px] font-medium ${
                    isLight
                      ? "bg-gray-200 text-gray-600"
                      : "bg-white/[0.08] text-gray-400"
                  }`}
                >
                  {pinnedChats.length}
                </span>
              )}
            </div>

            {pinnedChats.length === 0 ? (
              <div
                className={`mx-1 rounded-xl border border-dashed px-4 py-4 ${
                  isLight
                    ? "border-gray-200 bg-white/50"
                    : "border-white/[0.07] bg-white/[0.015]"
                }`}
              >
                <div className="flex items-start gap-3">
                  <div
                    className={`mt-0.5 rounded-lg p-2 ${
                      isLight
                        ? "bg-gray-100 text-gray-400"
                        : "bg-white/[0.05] text-gray-500"
                    }`}
                  >
                    <Pin size={14} />
                  </div>

                  <p
                    className={`text-xs leading-relaxed ${
                      isLight
                        ? "text-gray-400"
                        : "text-gray-500"
                    }`}
                  >
                    Pin important conversations to
                    access them quickly.
                  </p>
                </div>
              </div>
            ) : (
              <div className="space-y-1">
                {pinnedChats.map((chat) => (
                  <SidebarItem
                    key={chat.id}
                    chat={chat}
                    active={
                      activeChat?.id === chat.id
                    }
                  />
                ))}
              </div>
            )}
          </section>

          {/* RECENT CHATS */}
          <section>
            <div className="mb-2 flex items-center gap-2 px-2">
              <MessageSquare
                size={13}
                className="text-gray-500"
              />

              <h3 className="text-[11px] font-semibold uppercase tracking-wider text-gray-500">
                Recent Chats
              </h3>

              {recentChats.length > 0 && (
                <span
                  className={`ml-auto rounded-full px-2 py-0.5 text-[10px] font-medium ${
                    isLight
                      ? "bg-gray-200 text-gray-600"
                      : "bg-white/[0.08] text-gray-400"
                  }`}
                >
                  {recentChats.length}
                </span>
              )}
            </div>

            {recentChats.length === 0 ? (
              <div
                className={`mx-1 rounded-xl border border-dashed px-4 py-5 text-center ${
                  isLight
                    ? "border-gray-200 bg-white/50"
                    : "border-white/[0.07] bg-white/[0.015]"
                }`}
              >
                <div
                  className={`mx-auto mb-3 flex h-9 w-9 items-center justify-center rounded-full ${
                    isLight
                      ? "bg-gray-100 text-gray-400"
                      : "bg-white/[0.05] text-gray-500"
                  }`}
                >
                  <MessageSquare size={16} />
                </div>

                <p
                  className={`text-xs ${
                    isLight
                      ? "text-gray-400"
                      : "text-gray-500"
                  }`}
                >
                  Your conversations will appear here.
                </p>
              </div>
            ) : (
              <div className="space-y-1">
                {recentChats.map((chat) => (
                  <SidebarItem
                    key={chat.id}
                    chat={chat}
                    active={
                      activeChat?.id === chat.id
                    }
                  />
                ))}
              </div>
            )}
          </section>
        </div>

        {/* SECURITY STATUS */}
        <div
          className={`mx-3 mb-3 rounded-xl border px-3 py-2.5 ${
            isLight
              ? "border-gray-200 bg-white"
              : "border-white/[0.07] bg-[#171819]"
          }`}
        >
          <div className="flex items-center gap-2.5">
            <div
              className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-lg ${
                isLight
                  ? "bg-green-50 text-green-600"
                  : "bg-green-500/10 text-green-400"
              }`}
            >
              <Shield size={14} />
            </div>

            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-1.5">
                <span
                  className={`h-1.5 w-1.5 rounded-full ${
                    isLight
                      ? "bg-green-500"
                      : "bg-green-400"
                  }`}
                />

                <span className="text-[11px] font-medium">
                  Secure Session
                </span>
              </div>

              <p
                className={`mt-0.5 truncate text-[10px] ${
                  isLight
                    ? "text-gray-400"
                    : "text-gray-500"
                }`}
              >
                Offline AI environment
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* PROFILE */}
      <ProfileMenu collapsed={collapsed} />
    </aside>
  );
}