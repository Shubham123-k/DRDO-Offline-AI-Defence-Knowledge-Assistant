import api from "./axios";

export const transcribeAudio = async (audioBlob) => {
  const formData = new FormData();

  formData.append(
    "audio",
    audioBlob,
    "recording.webm"
  );

  const response = await api.post(
    "/voice/transcribe",
    formData
  );

  return response.data;
};