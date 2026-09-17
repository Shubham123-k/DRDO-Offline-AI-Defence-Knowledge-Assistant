import api from "./axios";

export const askAI = (
  question,
  conversationId,
  attachmentDocumentIds = [],
) =>
  api.post("/ai/ask", {
    conversation_id: Number(conversationId),
    question,
    attachment_document_ids: attachmentDocumentIds.map(Number),
  });

export const retrieveDocuments = (
  question,
  conversationId,
  attachmentDocumentIds = [],
) =>
  api.post("/ai/retrieve", {
    conversation_id: Number(conversationId),
    question,
    attachment_document_ids: attachmentDocumentIds.map(Number),
  });
