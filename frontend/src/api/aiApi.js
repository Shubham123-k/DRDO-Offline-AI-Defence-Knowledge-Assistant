import api from "./axios";


export const askAI = (
  question,
  conversationId,
) => {
  return api.post(
    "/ai/ask",
    {
      conversation_id: Number(conversationId),
      question: question,
    }
  );
};


export const retrieveDocuments = (
  question,
  conversationId,
) => {
  return api.post(
    "/ai/retrieve",
    {
      conversation_id: Number(conversationId),
      question: question,
    }
  );
};