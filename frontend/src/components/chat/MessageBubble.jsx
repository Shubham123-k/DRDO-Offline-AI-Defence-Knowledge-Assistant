import { Bot, UserRound, ShieldCheck } from "lucide-react";
import useTheme from "../../hooks/useTheme";
import MarkdownRenderer from "./MarkdownRenderer";
import MessageAttachment from "./MessageAttachment";

/* REMOVE RAG / PDF SOURCE INFORMATION */
function cleanAssistantContent(content) {
  if (!content) {
    return "";
  }

  let cleaned = content;

  cleaned = cleaned.replace(
    /\n\s*(?:#{1,6}\s*)?(?:Sources?|References?)\s*:?\s*[\s\S]*$/i,
    ""
  );

  cleaned = cleaned.replace(
    /\n\s*(?:#{1,6}\s*)?(?:Source|Reference)\s*:?\s*(?:[-*•]\s*.*\n?)+$/i,
    ""
  );

  cleaned = cleaned.replace(
    /\[\s*(?:Source\s*:\s*)?[^\\\]]+\.pdf\s*\]/gi,
    ""
  );

  cleaned = cleaned.replace(
    /(?:\n\s*)+(?:[-*•]\s*)?[^\n]*\.pdf\s*(?=\n|$)/gi,
    "\n"
  );

  cleaned = cleaned.replace(
    /\n{3,}/g,
    "\n\n"
  );

  return cleaned.trim();
}

export default function MessageBubble({ message }) {
  const { theme } = useTheme();
  const isUser = message.role === "user";

  const displayContent = isUser
    ? message.content
    : cleanAssistantContent(message.content);

  return (
    <div
      className={`group mb-7 flex w-full ${
        isUser ? "justify-end" : "justify-start"
      }`}
    >
      <div
        className={`flex max-w-4xl items-start gap-3 ${
          isUser ? "flex-row-reverse" : "flex-row"
        }`}
      >
        {/* AVATAR */}
        <div
          className={`mt-1 flex h-9 w-9 shrink-0 items-center justify-center rounded-xl shadow-sm ${
            isUser
              ? "bg-blue-600 text-white"
              : theme === "light"
              ? "border border-gray-200 bg-white text-gray-700"
              : "border border-white/10 bg-[#1B1B1B] text-gray-300"
          }`}
        >
          {isUser ? (
            <UserRound size={18} />
          ) : (
            <Bot size={19} />
          )}
        </div>

        {/* MESSAGE AREA= */}
        <div
          className={`flex min-w-0 flex-col ${
            isUser
              ? "items-end"
              : "items-start"
          }`}
        >
          {/* SENDER */}
          <div
            className={`mb-1.5 flex items-center gap-2 px-1 ${
              isUser
                ? "flex-row-reverse"
                : "flex-row"
            }`}
          >
            <span
              className={`text-xs font-semibold ${
                theme === "light"
                  ? "text-gray-500"
                  : "text-gray-400"
              }`}
            >
              {isUser
                ? "You"
                : "DRDO AI Assistant"}
            </span>

            {!isUser && (
              <span className="flex items-center gap-1 text-[10px] font-medium text-blue-500">
                <ShieldCheck size={12} />
                Offline AI
              </span>
            )}
          </div>

          {/* MESSAGE BUBBLE */}
          <div
            className={`relative rounded-2xl px-5 py-4 shadow-sm transition-all duration-200 ${
              isUser
                ? "rounded-tr-md bg-blue-600 text-white shadow-blue-600/10 hover:bg-blue-700"
                : theme === "light"
                ? "rounded-tl-md border border-gray-200 bg-white text-gray-900 hover:border-gray-300"
                : "rounded-tl-md border border-white/10 bg-[#1B1B1B] text-gray-100 hover:border-white/15"
            }`}
          >
            {/* Assistant accent */}

            {!isUser && (
              <div
                className={`absolute left-0 top-4 h-6 w-0.5 rounded-r-full ${
                  theme === "light"
                    ? "bg-blue-500"
                    : "bg-blue-400"
                }`}
              />
            )}

            {/* Persisted attachments */}
            {Array.isArray(message.attachments) && message.attachments.length > 0 && (
              <div className={message.content ? "mb-2" : ""}>
                {message.attachments.map((attachment) => (
                  <MessageAttachment
                    key={`${attachment.document_id}-${attachment.filename}`}
                    attachment={attachment}
                  />
                ))}
              </div>
            )}

            {/* Message content */}
            {displayContent && (
              <div className={!isUser ? "pl-1" : ""}>
                <MarkdownRenderer content={displayContent} />
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}