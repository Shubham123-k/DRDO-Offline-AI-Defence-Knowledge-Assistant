import api from "./axios";

export const getChats = () =>
    api.get("/chat");

export const createChat = (title) =>
    api.post("/chat/new", {
        title,
    });

export const getMessages = (id) =>
    api.get(`/chat/${id}/messages`);

export const addMessage = (
    id,
    role,
    content,
) =>
    api.post(
        `/chat/${id}/message?role=${role}`,
        {
            content,
        }
    );

export const renameChat = (
    id,
    title,
) =>
    api.put(
        `/chat/${id}/rename`,
        {
            title,
        }
    );

export const pinChat = (id) =>
    api.put(`/chat/${id}/pin`);

export const deleteChat = (id) =>
    api.delete(`/chat/${id}`);

export const getChat = (id) =>
    api.get(`/chat/${id}`);