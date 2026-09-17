import api from "./axios";

export const getChats = () => api.get("/chat/");

export const createChat = (title) =>
  api.post("/chat/new", { title });

export const getMessages = (chatId) =>
  api.get(`/chat/${chatId}/messages`);

export const addMessage = (
  chatId,
  role,
  content = "",
  attachments = [],
) =>
  api.post(
    `/chat/${chatId}/message`,
    {
      content,
      attachments,
    },
    {
      params: { role },
    },
  );

export const renameChat = (chatId, title) =>
  api.put(`/chat/${chatId}/rename`, { title });

export const pinChat = (chatId) =>
  api.put(`/chat/${chatId}/pin`);

export const deleteChat = (chatId) =>
  api.delete(`/chat/${chatId}`);
