import api from "./axios";

export const getAuditLogs = () =>
    api.get("/audit/logs");

export const getPendingUsers = () =>
    api.get("/admin/pending");

export const approveUser = (id) =>
    api.put(`/admin/approve/${id}`);

export const rejectUser = (id) =>
    api.put(`/admin/reject/${id}`);

export const getDashboardStats = () =>
  api.get("/admin/dashboard");

export const getUsers = () =>
  api.get("/admin/users");

export const updateUser = (id, data) =>
  api.put(`/admin/users/${id}`, data);                                                                                

export const deleteUser = (id) =>
  api.delete(`/admin/users/${id}`);

export const getDocuments = () =>
  api.get("/admin/documents");

export const downloadDocument = (id) =>
  api.get(`/admin/documents/download/${id}`, {
    responseType: "blob",
  });

export const deleteDocument = (id) =>
  api.delete(`/admin/documents/${id}`);