import { useRef, useState } from "react";
import { Paperclip, SendHorizontal } from "lucide-react";
import useTheme from "../../hooks/useTheme";
import { useChat } from "../../context/ChatContext";
import AttachmentPreview from "./AttachmentPreview";
import VoiceRecorder from "./VoiceRecorder";
import DropZone from "./DropZone";

import { askAI } from "../../api/aiApi";
import { uploadDocument } from "../../api/documentApi";

export default function ChatInput() {
  const { theme } = useTheme();

  const {
    addMessage,
    activeChat,
    createNewChat,
    setIsTyping,
    setStreamingText,
    setIsStreaming,
  } = useChat();

  const [message, setMessage] = useState("");
  const [files, setFiles] = useState([]);

  const [dragActive, setDragActive] = useState(false);

  const fileInputRef = useRef(null);

  const selectFiles = () => {
    fileInputRef.current?.click();
  };

  const onFilesSelected = (e) => {
    const selected = Array.from(e.target.files);
    setFiles((prev) => [...prev, ...selected]);
  };

  const removeFile = (index) => {
    setFiles((prev) => prev.filter((_, i) => i !== index));
  };

  const sendMessage = async () => {
    if (!message.trim() && files.length === 0) return;

    let chatId = activeChat?.id;

    if (!chatId) {
      chatId = await createNewChat();

      if (!chatId) return;
    }

    if (files.length > 0) {
      try {
        for (const file of files) {
          const formData = new FormData();

          formData.append("file", file);

          // Default classification for now.
          // Later we'll read the user's clearance or allow them to choose.
          formData.append("classification", "public");

          await uploadDocument(formData);
        }
      } catch (error) {
        console.error(error);

        await addMessage("assistant", "Document upload failed.", chatId);

        return;
      }
    }
    await addMessage("user", message.trim() || "[Uploaded Files]", chatId);

    setIsTyping(true);

    try {
      const aiResponse = await askAI(message.trim());

      const response = aiResponse.data.answer;

      setIsTyping(false);
      setIsStreaming(true);

      let index = 0;

      const interval = setInterval(async () => {
        setStreamingText(response.slice(0, index));

        index++;

        if (index > response.length) {
          clearInterval(interval);

          await addMessage("assistant", response, chatId);

          setStreamingText("");
          setIsStreaming(false);
        }
      }, 15);
    } catch (error) {
      setIsTyping(false);

      await addMessage(
        "assistant",
        "Sorry, I couldn't process your request.",
        chatId,
      );

      console.error(error);
    }

    setMessage("");
    setFiles([]);
  };

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
    const dropped = Array.from(e.dataTransfer.files);
    setFiles((prev) => [...prev, ...dropped]);
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

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
        <AttachmentPreview files={files} removeFile={removeFile} />

        <div
          className={`flex items-end gap-3 rounded-2xl border px-4 py-3 shadow-sm ${
            theme === "light"
              ? "border-gray-300 bg-white"
              : "border-white/10 bg-[#1B1B1B]"
          }`}
        >
          <button
            onClick={selectFiles}
            className="transition hover:opacity-70 hover:cursor-pointer"
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

          <textarea
            rows={1}
            value={message}
            onChange={(e) => {
              setMessage(e.target.value);

              e.target.style.height = "0px";
              e.target.style.height = `${e.target.scrollHeight}px`;
            }}
            onKeyDown={handleKeyDown}
            placeholder="Ask anything..."
            className="max-h-40 flex-1 resize-none overflow-y-auto bg-transparent outline-none"
          />

          <VoiceRecorder />

          <button
            onClick={sendMessage}
            disabled={!message.trim() && files.length === 0}
            className={`rounded-full p-2 transition hover:cursor-pointer ${
              message.trim() || files.length > 0
                ? "bg-blue-600 text-white hover:bg-blue-700"
                : "bg-gray-300 text-gray-500"
            }`}
          >
            <SendHorizontal size={18} />
          </button>
        </div>
      </div>
    </DropZone>
  );
}
