import { useRef, useState } from "react";
import { Paperclip, SendHorizontal } from "lucide-react";

import useTheme from "../../hooks/useTheme";
import { useChat } from "../../context/ChatContext";

import AttachmentPreview from "./AttachmentPreview";
import VoiceRecorder from "./VoiceRecorder";
import DropZone from "./DropZone";

import { uploadDocument } from "../../api/documentApi";


export default function ChatInput() {

  const { theme } = useTheme();

  const {
    activeChat,
    createNewChat,
    askAssistant,
  } = useChat();


  const [message, setMessage] =
    useState("");

  const [files, setFiles] =
    useState([]);

  const [dragActive, setDragActive] =
    useState(false);

  const [sending, setSending] =
    useState(false);


  const fileInputRef =
    useRef(null);

  // FILE SELECT
  const selectFiles = () => {
    fileInputRef.current?.click();
  };

  const onFilesSelected = (e) => {
    const selected =
      Array.from(
        e.target.files || []
      );

    setFiles((prev) => [
      ...prev,
      ...selected,
    ]);

    e.target.value = "";
  };

  const removeFile = (index) => {
    setFiles((prev) =>
      prev.filter(
        (_, i) => i !== index
      )
    );
  };

  // SEND
  const sendMessage = async () => {
    const question =
      message.trim();
    if (
      !question &&
      files.length === 0
    ) {
      return;
    }

    if (sending) {
      return;
    }
    setSending(true);

    try {

      let chatId =
        activeChat?.id;

      // CREATE CHAT
      if (!chatId) {
        chatId =
          await createNewChat();

        if (!chatId) {
          return;
        }
      }

      // UPLOAD FILES
      if (files.length > 0) {
        for (const file of files) {
          const formData =
            new FormData();

          formData.append(
            "file",
            file
          );

          formData.append(
            "classification",
            "Public"
          );

          await uploadDocument(
            formData
          );
        }
      }

      // ONLY UPLOAD
      if (!question) {

        setMessage("");
        setFiles([]);

        return;
      }

      // ASK AI
      await askAssistant(
        question,
        chatId
      );

      // CLEAR INPUT
      setMessage("");
      setFiles([]);

    } catch (error) {
      console.error(
        "Failed to send message:",
        error
      );

      const detail =
        error?.response?.data?.detail ||
        error?.message ||
        "Sorry, I couldn't process your request.";

      alert(detail);

    } finally {
      // ALWAYS STOP PROCESSING
      setSending(false);
    }
  };

  // DRAG & DROP
  const onDragEnter = (e) => {
    e.preventDefault();
    setDragActive(true);
  };

  const onDragLeave = (e) => {
    e.preventDefault();
    setDragActive(false);
  };

  const onDragOver = (e) => {
    e.preventDefault();
  };

  const onDrop = (e) => {
    e.preventDefault();
    setDragActive(false);

    const dropped =
      Array.from(
        e.dataTransfer.files || []
      );

    if (dropped.length > 0) {
      setFiles((prev) => [
        ...prev,
        ...dropped,
      ]);
    }
  };


  // ENTER
  const handleKeyDown = (e) => {
    if (
      e.key === "Enter" &&
      !e.shiftKey
    ) {
      e.preventDefault();
      sendMessage();
    }
  };

  // UI
  return (
    <DropZone
      dragActive={dragActive}
      onDragEnter={onDragEnter}
      onDragLeave={onDragLeave}
      onDragOver={onDragOver}
      onDrop={onDrop}
    >
      <div
        className={`shrink-0 border-t p-5 ${
          theme === "light"
            ? "border-gray-200 bg-white"
            : "border-white/10 bg-[#0B0B0B]"
        }`}
      >
        <AttachmentPreview
          files={files}
          removeFile={removeFile}
        />
        <div
          className={`flex items-end gap-3 rounded-2xl border px-4 py-3 shadow-sm ${
            theme === "light"
              ? "border-gray-300 bg-white"
              : "border-white/10 bg-[#1B1B1B]"
          }`}
        >

          {/* ATTACHMENT */}
          <button
            type="button"
            onClick={selectFiles}
            disabled={sending}
            className="transition hover:cursor-pointer hover:opacity-70 disabled:cursor-not-allowed disabled:opacity-40"
            title="Attach files"
          >
            <Paperclip size={22} />
          </button>
          <input
            ref={fileInputRef}
            hidden
            multiple
            type="file"
            accept=".pdf,.doc,.docx,.xls,.xlsx,.csv,.txt,.png,.jpg,.jpeg"
            onChange={onFilesSelected}
          />

          {/* TEXT */}
          <textarea
            rows={1}
            value={message}
            disabled={sending}
            onChange={(e) => {
              setMessage(
                e.target.value
              );
              e.target.style.height =
                "0px";
              e.target.style.height =
                `${Math.min(
                  e.target.scrollHeight,
                  160
                )}px`;
            }}
            onKeyDown={handleKeyDown}
            placeholder={
              sending
                ? "Generating response..."
                : "Ask anything..."
            }
            className="max-h-40 flex-1 resize-none overflow-y-auto bg-transparent outline-none disabled:cursor-not-allowed disabled:opacity-60"
          />

          {/* VOICE */}
          <VoiceRecorder />

          {/* SEND */}
          <button
            type="button"
            onClick={sendMessage}
            disabled={
              sending ||
              (
                !message.trim() &&
                files.length === 0
              )
            }
            className={`rounded-full p-2 transition ${
              message.trim() &&
              !sending
                ? "bg-blue-600 text-white hover:bg-blue-700"
                : "bg-gray-300 text-gray-500"
            } ${
              sending
                ? "cursor-not-allowed opacity-50"
                : "hover:cursor-pointer"
            }`}
            title="Send message"
          >
            <SendHorizontal size={18} />
          </button>
        </div>

        {/* STATUS */}
        <div
          className={`mt-2 text-center text-xs ${
            theme === "light"
              ? "text-gray-400"
              : "text-gray-500"
          }`}
        >
          {sending
            ? "DRDO AI Assistant is processing your request..."
            : "Offline Defence Knowledge Assistant"}
        </div>
      </div>
    </DropZone>
  );
}