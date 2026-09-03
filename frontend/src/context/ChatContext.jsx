import { createContext, useContext, useState, useEffect } from "react";
import { getChats, createChat, getMessages,
  addMessage as addMessageApi,
  renameChat as renameChatApi,
  pinChat as pinChatApi,
  deleteChat as deleteChatApi,
} from "../api/chatApi";

import { askAI } from "../api/aiApi";

const ChatContext = createContext();

export function ChatProvider({ children }) {
  const [chats, setChats] = useState([]);
  const [loadingChats, setLoadingChats] =
    useState(true);


  const [activeChatId, setActiveChatId] = useState(null);
  const [isTyping, setIsTyping] = useState(false);
  const [streamingText, setStreamingText] = useState("");

  const [isStreaming, setIsStreaming] = useState(false);
  const [aiSources, setAiSources] = useState([]);
  const [aiModel, setAiModel] = useState(null);
  const [processingTime, setProcessingTime] = useState(null);

  useEffect(() => {
    loadChats();
  }, []);

  const loadChats = async () => {
    try {
      setLoadingChats(true);

      const response =
        await getChats();

      const backendChats =
        response.data.map((chat) => ({
          id: chat.id,
          title:
            chat.title || "New Chat",

          pinned:
            chat.pinned || false,

          classification:
            chat.classification ||
            "Public",

          createdAt:
            chat.created_at,

          updatedAt:
            chat.updated_at,

          messages: [],
        }));

      setChats(backendChats);
      setActiveChatId(null);

      // Reset AI state for the fresh conversation
      setAiSources([]);
      setAiModel(null);
      setProcessingTime(null);

      setIsTyping(false);
      setIsStreaming(false);
      setStreamingText("");

    } catch (error) {
      console.error(
        "Failed to load chats:",
        error
      );
      setActiveChatId(null);

    } finally {
      setLoadingChats(false);
    }
  };

  // LOAD MESSAGES
  const loadMessages = async (chatId) => {
    if (!chatId) {
      return;
    }

    try {
      const response =
        await getMessages(chatId);

      setChats((prev) =>
        prev.map((chat) =>
          chat.id === chatId
            ? {
                ...chat,

                messages:
                  response.data.map(
                    (message) => ({
                      id:
                        message.id,

                      role:
                        message.role,

                      content:
                        message.content,

                      createdAt:
                        message.created_at,
                    })
                  ),
              }
            : chat
        )
      );

    } catch (error) {
      console.error(
        "Failed to load messages:",
        error
      );
    }
  };

  // SELECT EXISTING CHAT
  const selectChat = async (chatId) => {
    if (!chatId) {
      return;
    }

    setActiveChatId(chatId);

    // Clear AI information belonging to another chat
    setAiSources([]);
    setAiModel(null);
    setProcessingTime(null);

    setIsTyping(false);
    setIsStreaming(false);
    setStreamingText("");

    await loadMessages(chatId);
  };

  // CREATE NEW CHAT
  const createNewChat = async (
    classification = "Public"
  ) => {
    try {
      const response =
        await createChat("New Chat");

      const chat = {
        id:
          response.data.id,

        title:
          response.data.title ||
          "New Chat",

        pinned:
          response.data.pinned ||
          false,

        classification,

        createdAt:
          response.data.created_at,

        updatedAt:
          response.data.updated_at,

        messages: [],
      };

      setChats((prev) => [
        chat,
        ...prev,
      ]);

      setActiveChatId(chat.id);

      setAiSources([]);
      setAiModel(null);
      setProcessingTime(null);

      setIsTyping(false);
      setIsStreaming(false);
      setStreamingText("");

      return chat.id;

    } catch (error) {
      console.error(
        "Failed to create chat:",
        error
      );

      return null;
    }
  };

  // ACTIVE CHAT
  const activeChat =
    chats.find(
      (chat) =>
        chat.id === activeChatId
    );

  const addMessage = async (
    role,
    content,
    chatId = activeChatId
  ) => {
    if (!chatId) {
      console.error(
        "Cannot save message: no active chat."
      );

      return null;
    }

    try {
      const response =
        await addMessageApi(
          chatId,
          role,
          content
        );

      setChats((prev) =>
        prev.map((chat) =>
          chat.id === chatId
            ? {
                ...chat,

                title:
                  role === "user" &&
                  chat.messages.length === 0
                    ? content.slice(0, 35)
                    : chat.title,

                messages: [
                  ...chat.messages,

                  {
                    id:
                      response.data.id,

                    role:
                      response.data.role,

                    content:
                      response.data.content,

                    createdAt:
                      response.data.created_at,
                  },
                ],
              }
            : chat
        )
      );

      return response.data;

    } catch (error) {
      console.error(
        "Failed to save message:",
        error
      );

      return null;
    }
  };

  // ASK AI
  const askAssistant = async (
    question,
    conversationId = activeChatId
  ) => {
    if (!conversationId) {
      throw new Error(
        "No active conversation selected."
      );
    }

    try {
      console.log(
        "Sending question to AI:",
        question
      );

      console.log(
        "Conversation ID:",
        conversationId
      );

      setIsTyping(true);

      const response =
        await askAI(
          question,
          conversationId
        );

      const answer =
        response.data.answer;

      await addMessage(
        "assistant",
        answer,
        conversationId
      );

      return response.data;

    } catch (error) {
      console.error(
        "AI request failed:",
        error
      );

      throw error;

    } finally {
      setIsTyping(false);
    }
  };

  // PIN CHAT
  const pinChat = async (chatId) => {
    try {
      await pinChatApi(chatId);
      setChats((prev) =>
        prev.map((chat) =>
          chat.id === chatId
            ? {
                ...chat,
                pinned: !chat.pinned,
              }
            : chat
        )
      );

    } catch (error) {
      console.error(
        "Failed to pin chat:",
        error
      );
    }
  };

  // RENAME CHAT
  const renameChat = async (
    chatId,
    newTitle
  ) => {
    if (!newTitle?.trim()) {
      return;
    }

    try {
      await renameChatApi(
        chatId,
        newTitle.trim()
      );

      setChats((prev) =>
        prev.map((chat) =>
          chat.id === chatId
            ? {
                ...chat,

                title:
                  newTitle.trim(),
              }
            : chat
        )
      );

    } catch (error) {
      console.error(
        "Failed to rename chat:",
        error
      );
    }
  };

  // DELETE CHAT
  const deleteChat = async (chatId) => {
    try {
      await deleteChatApi(chatId);

      setChats((prev) =>
        prev.filter(
          (chat) =>
            chat.id !== chatId
        )
      );

      if (activeChatId === chatId) {
        setActiveChatId(null);

        setAiSources([]);
        setAiModel(null);
        setProcessingTime(null);

        setIsTyping(false);
        setIsStreaming(false);
        setStreamingText("");
      }

    } catch (error) {
      console.error(
        "Failed to delete chat:",
        error
      );
    }
  };

  return (
    <ChatContext.Provider
      value={{
        chats,
        activeChat,
        activeChatId,
        createNewChat,
        selectChat,
        addMessage,
        askAssistant,
        pinChat,
        renameChat,
        deleteChat,
        loadingChats,
        isTyping,
        setIsTyping,
        streamingText,
        setStreamingText,
        isStreaming,
        setIsStreaming,
        aiSources,
        aiModel,
        processingTime,
        loadChats,
        loadMessages,
      }}
    >
      {children}
    </ChatContext.Provider>
  );
}

export const useChat = () =>
  useContext(ChatContext);