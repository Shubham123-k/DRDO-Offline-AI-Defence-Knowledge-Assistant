import { useChat } from "../../context/ChatContext";
import ChatHeader from "./ChatHeader";
import WelcomeScreen from "./WelcomeScreen";
import ChatMessages from "./ChatMessages";
import ChatInput from "./ChatInput";

export default function ChatWindow() {
  const { activeChat } = useChat();

  const hasMessages =
    activeChat &&
    (activeChat.messages.length > 0);

  return (
    <div className="flex h-full flex-1 flex-col">
      <ChatHeader />
      <main className="flex flex-1 overflow-hidden">
        {hasMessages ? (
          <ChatMessages />
        ) : (
          <WelcomeScreen />
        )}
      </main>
      <ChatInput />
    </div>
  );
}