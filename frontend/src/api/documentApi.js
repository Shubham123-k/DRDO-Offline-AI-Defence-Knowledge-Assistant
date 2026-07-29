import api from "./axios";

export const uploadDocument = (formData) =>
  api.post("/documents/upload", formData, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });

export const getDocuments = () =>
  api.get("/documents");

export const downloadDocument = (id) =>
  `${api.defaults.baseURL}/documents/download/${id}`;

export const deleteDocument = (id) =>
  api.delete(`/documents/${id}`);                                                                                                           