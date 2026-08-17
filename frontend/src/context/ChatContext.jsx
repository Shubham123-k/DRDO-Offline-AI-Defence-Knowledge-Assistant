import { createContext, useContext, useState, useEffect } from "react";
import { getChats, createChat,getMessages,
  addMessage as addMessageApi,
  renameChat as renameChatApi,
  pinChat as pinChatApi,
  deleteChat as deleteChatApi,
} from "../api/chatApi";

import { askAI } from "../api/aiApi";

const ChatContext = createContext();

export function ChatProvider({ children }) {
  const [chats, setChats] = useState([]);
  const [loadingChats, setLoadingChats] = useState(true);
  const [activeChatId, setActiveChatId] = useState(null);

  const [isTyping, setIsTyping] = useState(false);
  const [streamingText, setStreamingText] = useState("");
  const [isStreaming, setIsStreaming] = useState(false);

  const [aiSources, setAiSources] = useState([]);
  const [aiModel, setAiModel] = useState(null);
  const [processingTime, setProcessingTime] = useState(null);

  // LOAD CHATS
  useEffect(() => {
    loadChats();
  }, []);

  const loadChats = async () => {
    try {
      setLoadingChats(true);
      const response = await getChats();
      const backendChats =
        response.data.map((chat) => ({
          id: chat.id,
          title: chat.title,
          pinned: chat.pinned,
          classification:
            chat.classification || "Public",
          createdAt:
            chat.created_at,
          updatedAt:
            chat.updated_at,
          messages: [],
        }));

      setChats(backendChats);

      if (backendChats.length > 0) {
        setActiveChatId(
          backendChats[0].id
        );
      }

    } catch (error) {
      console.error(
        "Failed to load chats:",
        error
      );
    } finally {
      setLoadingChats(false);
    }
  };


  // LOAD MESSAGEs
  const loadMessages = async (chatId) => {
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
                      id: message.id,
                      role: message.role,
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

  // SELECT CHAT
  const selectChat = async (chatId) => {

    setActiveChatId(chatId);

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
        id: response.data.id,
        title:
          response.data.title ||
          "New Chat",
        pinned:
          response.data.pinned || false,
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

  // NORMAL MESSAGE
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
    chatId = activeChatId
  ) => {

    if (!chatId) {
      throw new Error(
        "No active conversation."
      );
    }

    if (!question?.trim()) {
      throw new Error(
        "Question cannot be empty."
      );
    }

    // START TYPING
    setIsTyping(true);
    setIsStreaming(false);
    setStreamingText("");

    setAiSources([]);
    setAiModel(null);
    setProcessingTime(null);

    try {

      console.log(
        "Sending question to AI:",
        question
      );
      console.log(
        "Conversation ID:",
        chatId
      );

      // CALL BACKEND
      const response =
        await askAI(
          chatId,
          question.trim()
        );

      console.log(
        "AI response:",
        response.data
      );

      const data =
        response.data;

      const answer =
        data?.answer ||
        "I couldn't generate an answer.";

      // SAVE AI METADATA
      setAiSources(
        data.sources || []
      );

      setAiModel(
        data.model ||
        "gemma4:26b"
      );

      setProcessingTime(
        data.processing_time ??
        null
      );

      setIsTyping(false);

      setChats((prev) =>
        prev.map((chat) => {

          if (chat.id !== chatId) {
            return chat;
          }

          const existingMessages =
            chat.messages || [];

          const alreadyHasUserMessage =
            existingMessages.some(
              (message) =>
                message.role === "user" &&
                message.content ===
                  question.trim()
            );

          const alreadyHasAssistantMessage =
            existingMessages.some(
              (message) =>
                message.role === "assistant" &&
                message.content === answer
            );

          let newMessages =
            [...existingMessages];

          if (!alreadyHasUserMessage) {
            newMessages.push({
              id:
                `user-${Date.now()}`,
              role: "user",
              content:
                question.trim(),
            });
          }

          if (!alreadyHasAssistantMessage) {
            newMessages.push({
              id:
                `assistant-${Date.now()}-${Math.random()}`,
              role: "assistant",
              content: answer,
            });
          }

          return {
            ...chat,
            title:
              existingMessages.length === 0
                ? question.trim().slice(0, 35)
                : chat.title,
            messages:
              newMessages,
          };
        })
      );

      // FINISH ALL LOADING STATES
      setIsStreaming(false);
      setStreamingText("");
      setIsTyping(false);

      return data;

    } catch (error) {
      console.error(
        "AI request failed:",
        error
      );

      setIsTyping(false);
      setIsStreaming(false);
      setStreamingText("");

      throw error;
    }
  };

  // PIN CHAT
  const pinChat = async (chatId) => {
    try {
      await pinChatApi(chatId);
      await loadChats();
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

  // PROVIDER
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