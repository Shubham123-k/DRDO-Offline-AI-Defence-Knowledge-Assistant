import { useEffect, useRef } from "react";
import { useChat } from "../../context/ChatContext";
import MessageBubble from "./MessageBubble";
import TypingIndicator from "./TypingIndicator";
import StreamingMessage from "./StreamingMessage";

export default function ChatMessages() {
  const { activeChat, isTyping, isStreaming, streamingText } = useChat();

  const bottomRef = useRef(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({
      behavior: "smooth",
    });
  }, [activeChat?.messages.length, isStreaming, streamingText]);

  if (!activeChat) return null;

  return (
    <div className="flex h-full w-full flex-col overflow-y-auto px-8 py-8">
      {activeChat.messages.map((message) => (
        <MessageBubble key={message.id} message={message} />
      ))}

      {isTyping && <TypingIndicator />}

      {isStreaming && <StreamingMessage text={streamingText} />}

      <div ref={bottomRef} />
    </div>
  );
}
