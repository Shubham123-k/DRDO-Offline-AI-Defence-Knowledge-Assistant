import useTheme from "../../hooks/useTheme";
import SidebarHeader from "./SidebarHeader";
import ProfileMenu from "./ProfileMenu";
import { useChat } from "../../context/ChatContext";
import SidebarItem from "./SidebarItem";

export default function Sidebar() {
  const { theme } = useTheme();

  const {
    chats,
    activeChat,
    createNewChat,
  } = useChat();

  // Separate chats into pinned and recent
  const pinnedChats = chats.filter((chat) => chat.pinned);
  const recentChats = chats.filter((chat) => !chat.pinned);

  return (
    <aside
      className={`flex h-screen w-[280px] flex-col border-r transition-all duration-300 ${
        theme === "light"
          ? "border-gray-200 bg-gray-50"
          : "border-white/10 bg-[#111111]"
      }`}
    >
      {/* Sidebar Header */}
      <SidebarHeader />

      {/* Sidebar Content */}
      <div className="flex-1 overflow-y-auto px-4 py-4">
        {/* New Chat */}
        <button
          onClick={createNewChat}
          className={`mb-8 flex w-full items-center gap-3 rounded-2xl border px-4 py-3 transition-all duration-200 hover:cursor-pointer ${
            theme === "light"
              ? "border-gray-300 bg-gray-50 hover:bg-gray-100"
              : "border-white/10 bg-[#1E1E1E] hover:bg-[#2A2A2A]"
          }`}
        >
          <span className="text-xl">＋</span>

          <span className="font-medium">
            New Chat
          </span>
        </button>

        {/* PINNED */}
        <div className="mb-8">
          <h3
            className={`mb-3 text-sm font-semibold ${
              theme === "light"
                ? "text-gray-600"
                : "text-gray-400"
            }`}
          >
            Pinned
          </h3>

          {pinnedChats.length === 0 ? (
            <p className="text-sm text-gray-500">
              Start pinning chats to keep them here.
            </p>
          ) : (
            <div className="space-y-2">
              {pinnedChats.map((chat) => (
                <SidebarItem
                  key={chat.id}
                  chat={chat}
                  active={activeChat?.id === chat.id}
                />
              ))}
            </div>
          )}
        </div>

        {/* RECENT */}
        <div>
          <h3
            className={`mb-3 text-sm font-semibold ${
              theme === "light"
                ? "text-gray-600"
                : "text-gray-400"
            }`}
          >
            Recent Chats
          </h3>

          {recentChats.length === 0 ? (
            <p className="text-sm text-gray-500">
              Your conversations will appear here.
            </p>
          ) : (
            <div className="space-y-2">
              {recentChats.map((chat) => (
                <SidebarItem
                  key={chat.id}
                  chat={chat}
                  active={activeChat?.id === chat.id}
                />
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Bottom User Profile */}
      <ProfileMenu />
    </aside>
  );  
}                                                                                                                                                                                                                           