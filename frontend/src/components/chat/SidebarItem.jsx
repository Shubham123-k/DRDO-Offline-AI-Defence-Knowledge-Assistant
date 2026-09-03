import { MessageSquare, Pin } from "lucide-react";
import ChatActionsMenu from "./ChatActionsMenu";
import { useChat } from "../../context/ChatContext";
import useTheme from "../../hooks/useTheme";

export default function SidebarItem({
  chat,
  active,
}) {
  const { theme } = useTheme();

  const {
    selectChat,
    pinChat,
    renameChat,
    deleteChat,
  } = useChat();

  const isLight = theme === "light";

  const handleRename = () => {
    const title = prompt(
      "Rename conversation",
      chat.title
    );

    if (
      title &&
      title.trim() !== ""
    ) {
      renameChat(
        chat.id,
        title.trim()
      );
    }
  };

  const handleDelete = () => {
    const confirmed = window.confirm(
      `Delete "${chat.title}"?\n\nThis action cannot be undone.`
    );

    if (confirmed) {
      deleteChat(chat.id);
    }
  };

  return (
    <div
      className={`group relative flex min-h-[48px] items-center rounded-xl border px-2 transition-all duration-200 ${
        active
          ? isLight
            ? "border-gray-200 bg-white shadow-sm"
            : "border-white/[0.08] bg-[#1c1d1e] shadow-sm"
          : isLight
          ? "border-transparent hover:border-gray-200 hover:bg-white"
          : "border-transparent hover:border-white/[0.06] hover:bg-[#18191a]"
      }`}
    >
      {active && (
        <span
          className={`absolute left-0 top-1/2 h-6 w-0.5 -translate-y-1/2 rounded-full ${
            isLight
              ? "bg-blue-600"
              : "bg-blue-500"
          }`}
        />
      )}

      <button
        type="button"
        onClick={() =>
          selectChat(chat.id)
        }
        className="flex min-w-0 flex-1 items-center gap-3 overflow-hidden px-2 py-2 text-left"
      >
        <div
          className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-lg transition-colors ${
            active
              ? isLight
                ? "bg-blue-50 text-blue-600"
                : "bg-blue-500/10 text-blue-400"
              : isLight
              ? "bg-gray-100 text-gray-500 group-hover:bg-gray-200 group-hover:text-gray-700"
              : "bg-white/[0.05] text-gray-500 group-hover:bg-white/[0.08] group-hover:text-gray-300"
          }`}
        >
          <MessageSquare
            size={15}
            strokeWidth={1.9}
          />
        </div>

        <div className="min-w-0 flex-1">
          <p
            className={`truncate text-sm ${
              active
                ? "font-medium"
                : "font-normal"
            } ${
              isLight
                ? active
                  ? "text-gray-900"
                  : "text-gray-700"
                : active
                ? "text-white"
                : "text-gray-300"
            }`}
          >
            {chat.title}
          </p>
        </div>

        {chat.pinned && (
          <Pin
            size={13}
            strokeWidth={2}
            className={`shrink-0 ${
              isLight
                ? "text-gray-400"
                : "text-gray-500"
            }`}
          />
        )}
      </button>

      <div
        className={`shrink-0 pr-1 transition-all duration-200 ${
          active
            ? "opacity-100"
            : "opacity-0 group-hover:opacity-100"
        }`}
      >
        <ChatActionsMenu
          onPin={() =>
            pinChat(chat.id)
          }
          onRename={handleRename}
          onDelete={handleDelete}
        />
      </div>
    </div>
  );
}