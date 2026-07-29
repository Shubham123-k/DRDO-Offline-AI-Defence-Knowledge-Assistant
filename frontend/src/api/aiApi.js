import api from "./axios";

export const askAI = (question) =>
  api.post("/ai/ask", {
    question,
  });