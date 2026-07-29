import api from "./axios";

export const getProfile = () =>
  api.get("/protected/profile");

export const updateProfile = (data) =>
  api.put("/protected/profile", data);

export const deleteAccount = () => {
  return api.delete("/profile/delete");
};