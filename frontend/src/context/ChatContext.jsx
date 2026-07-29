import { createContext, useContext, useState, useEffect } from "react";

import {
  getChats,
  createChat,
  getMessages,
  addMessage as addMessageApi,
} from "../api/chatApi";

const ChatContext = createContext();

export function ChatProvider({ children }) {
  const [chats, setChats] = useState([]);
  const [loadingChats, setLoadingChats] = useState(true);

  const [activeChatId, setActiveChatId] = useState(null);
  const [isTyping, setIsTyping] = useState(false);

  const [streamingText, setStreamingText] = useState("");
  const [isStreaming, setIsStreaming] = useState(false);

  useEffect(() => {
    loadChats();
  }, []);

  const loadChats = async () => {
    try {
      setLoadingChats(true);

      const response = await getChats();

      const backendChats = response.data.map((chat) => ({
        id: chat.id,
        title: chat.title,
        pinned: chat.pinned,
        classification: chat.classification,
        createdAt: chat.created_at,
        messages: [],
      }));

      setChats(backendChats);

      if (backendChats.length > 0) {
        setActiveChatId(backendChats[0].id);
      }
    } catch (error) {
      console.error("Failed to load chats:", error);
    } finally {
      setLoadingChats(false);
    }
  };

  const loadMessages = async (chatId) => {
    try {
      const response = await getMessages(chatId);

      setChats((prev) =>
        prev.map((chat) =>
          chat.id === chatId
            ? {
                ...chat,
                messages: response.data.map((message) => ({
                  id: message.id,
                  role: message.role,
                  content: message.content,
                })),
              }
            : chat,
        ),
      );
    } catch (error) {
      console.error("Failed to load messages:", error);
    }
  };

  const selectChat = async (chatId) => {
    setActiveChatId(chatId);

    await loadMessages(chatId);
  };

  const createNewChat = async (classification = "Public") => {
    try {
      const response = await createChat("New Chat");

      const chat = {
        id: response.data.id,
        title: response.data.title,
        pinned: response.data.pinned,
        classification,
        createdAt: response.data.created_at,
        messages: [],
      };

      setChats((prev) => [chat, ...prev]);

      selectChat(chat.id);

      return chat.id;
    } catch (error) {
      console.error("Failed to create chat:", error);
      return null;
    }
  };

  const activeChat = chats.find((chat) => chat.id === activeChatId);

  const addMessage = async (role, content, chatId = activeChatId) => {
    try {
      const response = await addMessageApi(chatId, role, content);

      setChats((prev) =>
        prev.map((chat) =>
          chat.id === chatId
            ? {
                ...chat,
                title:
                  chat.messages.length === 0
                    ? content.slice(0, 35)
                    : chat.title,
                messages: [
                  ...chat.messages,
                  {
                    id: response.data.id,
                    role: response.data.role,
                    content: response.data.content,
                  },
                ],
              }
            : chat,
        ),
      );

      return response.data;
    } catch (error) {
      console.error("Failed to save message:", error);
      return null;
    }
  };

  const pinChat = (chatId) => {
    setChats((prev) =>
      prev.map((chat) =>
        chat.id === chatId
          ? {
              ...chat,
              pinned: !chat.pinned,
            }
          : chat,
      ),
    );
  };

  const renameChat = (chatId, newTitle) => {
    if (!newTitle.trim()) return;

    setChats((prev) =>
      prev.map((chat) =>
        chat.id === chatId
          ? {
              ...chat,
              title: newTitle,
            }
          : chat,
      ),
    );
  };

  const deleteChat = (chatId) => {
    setChats((prev) => prev.filter((chat) => chat.id !== chatId));

    if (activeChatId === chatId) {
      setActiveChatId(null);
    }
  };

  return (
    <ChatContext.Provider
      value={{
        chats,
        activeChat,
        createNewChat,
        addMessage,
        pinChat,
        renameChat,
        deleteChat,
        selectChat,
        isTyping,
        setIsTyping,
        streamingText,
        setStreamingText,
        isStreaming,
        setIsStreaming,
        loadingChats,
      }}
    >
      {children}
    </ChatContext.Provider>
  );
}

export const useChat = () => useContext(ChatContext);
