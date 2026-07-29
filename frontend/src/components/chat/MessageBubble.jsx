import useTheme from "../../hooks/useTheme";
import MarkdownRenderer from "./MarkdownRenderer";

export default function MessageBubble({ message }) {
  const { theme } = useTheme();

  const isUser = message.role === "user";

  return (
    <div
      className={`mb-6 flex ${
        isUser ? "justify-end" : "justify-start"
      }`}
    >
      <div
        className={`max-w-3xl rounded-2xl px-5 py-4 shadow-sm ${
          isUser
            ? "bg-blue-600 text-white"
            : theme === "light"
            ? "bg-gray-100 text-gray-900 border border-gray-200"
            : "bg-[#202123] text-white border border-white/10"
        }`}
      >
        <MarkdownRenderer content={message.content} />
      </div>
    </div>
  );
}