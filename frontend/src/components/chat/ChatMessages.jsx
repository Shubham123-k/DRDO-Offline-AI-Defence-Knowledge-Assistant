import { useEffect, useRef } from "react";
import { useChat } from "../../context/ChatContext";
import MessageBubble from "./MessageBubble";
import TypingIndicator from "./TypingIndicator";

export default function ChatMessages() {

  const {
    activeChat,
    isTyping,
  } = useChat();

  const bottomRef =
    useRef(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({
      behavior: "smooth",
    });

  }, [
    activeChat?.messages?.length,
    isTyping,
  ]);

  if (!activeChat) {
    return null;
  }

  const messages =
    activeChat.messages || [];

  return (
    <div
      className="flex h-full w-full flex-col overflow-y-auto px-8 py-8"
    >

      {/* MESSAGES */}
      {messages.map((message) => (
        <MessageBubble
          key={message.id}
          message={message}
        />
      ))}

      {/* TYPING INDICATOR */}
      {isTyping && (
        <TypingIndicator />
      )}

      {/*BOTTOM SCROLL TARGET*/}
      <div
        ref={bottomRef}
      />
    </div>
  );
}