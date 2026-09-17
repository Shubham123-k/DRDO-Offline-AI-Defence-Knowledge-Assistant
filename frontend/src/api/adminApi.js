import api from "./axios";

export const getDashboardStats = () =>
  api.get("/admin/dashboard");

export const getPendingUsers = () =>
  api.get("/admin/pending");

export const approveUser = (id) =>
  api.put(`/admin/approve/${id}`);

export const rejectUser = (id) =>
  api.put(`/admin/reject/${id}`);

export const getAllUsers = () =>
  api.get("/admin/users");

export const updateUser = (id, data) =>
  api.put(`/admin/users/${id}`, data);

export const deleteUser = (id) =>
  api.delete(`/admin/users/${id}`);

export const createSecureUser = (data) =>
  api.post("/admin/secure-users", data);

export const verifySecureDetails = (adminPassword) =>
  api.post("/admin/secure-details/verify", {
    admin_password: adminPassword,
  });

export const resetSecureUserPassword = (id, data) =>
  api.post(`/admin/secure-details/${id}/reset-password`, data);

export const getAdminDocuments = () =>
  api.get("/admin/documents");

export const downloadAdminDocument = (id) =>
  api.get(`/admin/documents/download/${id}`, {
    responseType: "blob",
  });

export const deleteAdminDocument = (id) =>
  api.delete(`/admin/documents/${id}`);

export const getAuditLogs = () =>
  api.get("/audit/logs");
