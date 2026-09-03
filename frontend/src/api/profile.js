import api from "./axios";

export const getProfile = () => {
  return api.get("/protected/profile");
};

export const updateProfile = (data) => {
  return api.put("/protected/profile", data);
};

export const deleteAccount = () => {
  return api.delete("/auth/account");
};

export const getSecurityQuestions = (email) => {
  return api.post("/auth/forgot-password/questions", {
    email,
  });
};

export const verifySecurityAnswers = (data) => {
  return api.post(
    "/auth/forgot-password/verify",
    data
  );
};

export const updateUserProfile = (data) => {
  return api.post(
    "/auth/forgot-password/reset",
    data
  );
};