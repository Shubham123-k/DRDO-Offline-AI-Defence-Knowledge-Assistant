import api from "./axios";

export const askAI = (
  conversationId,
  question
) => {
  return api.post("/ai/ask", {
    conversation_id: conversationId,
    question: question,
  });
};

export const retrieveDocuments = (
  conversationId,
  question
) => {
  return api.post("/ai/retrieve", {
    conversation_id: conversationId,
    question: question,
  });
};