import { MessageSquare } from "lucide-react";
import ChatActionsMenu from "./ChatActionsMenu";
import { useChat } from "../../context/ChatContext";
import useTheme from "../../hooks/useTheme";

export default function SidebarItem({ chat, active }) {
  const { theme } = useTheme();

  const {
    setActiveChatId,
    pinChat,
    renameChat,
    deleteChat,
  } = useChat();

  const handleRename = () => {
    const title = prompt("Rename conversation", chat.title);

    if (title) {
      renameChat(chat.id, title);
    }
  };

  return (
    <div
      className={`group flex items-center justify-between rounded-xl px-3 py-3 transition ${
        active
          ? theme === "light"
            ? "bg-gray-200"
            : "bg-[#2B2B2B]"
          : theme === "light"
          ? "hover:bg-gray-100"
          : "hover:bg-[#1B1B1B]"
      }`}
    >
      <button
        onClick={() => setActiveChatId(chat.id)}
        className="flex flex-1 items-center gap-3 overflow-hidden"
      >
        <MessageSquare size={18} />

        <span className="truncate">
          {chat.title}
        </span>
      </button>

      <div className="opacity-0 transition-opacity group-hover:opacity-100">
        <ChatActionsMenu
          onPin={() => pinChat(chat.id)}
          onRename={handleRename}
          onDelete={() => deleteChat(chat.id)}
        />
      </div>
    </div>
  );
}