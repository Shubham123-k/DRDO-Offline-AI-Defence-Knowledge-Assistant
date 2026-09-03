import api from "./axios";

export const login = (data) =>
  api.post("/auth/login", data);

export const signup = (data) =>
  api.post("/auth/signup", data);

export const getSecurityQuestions = (
  email
) =>
  api.post(
    "/auth/forgot-password/questions",
    {
      email,
    }
  );

export const verifySecurityAnswers = (
  data
) =>
  api.post(
    "/auth/forgot-password/verify",
    data
  );

export const resetPassword = (
  data
) =>
  api.post(
    "/auth/forgot-password/reset",
    data
  );