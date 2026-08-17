import api from "./axios";

export const getConversations = () =>
  api.get("/conversations");

export const createConversation = (title = "New Chat") =>
  api.post("/conversations", {
    title,
  });

export const renameConversation = (id, title) =>
  api.put(`/conversations/${id}`, {
    title,
  });

export const deleteConversation = (id) =>
  api.delete(`/conversations/${id}`);

export const pinConversation = (id) =>
  api.put(`/conversations/${id}/pin`);