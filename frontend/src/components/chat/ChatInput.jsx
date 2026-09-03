import { useRef, useState } from "react";
import { Paperclip, SendHorizontal, Shield, ChevronDown, Sparkles } from "lucide-react";

import useTheme from "../../hooks/useTheme";
import { useChat } from "../../context/ChatContext";

import AttachmentPreview from "./AttachmentPreview";
import VoiceRecorder from "./VoiceRecorder";
import DropZone from "./DropZone";

import { uploadDocument } from "../../api/documentApi";

export default function ChatInput() {
  const { theme } = useTheme();

  const { activeChat, createNewChat, addMessage, askAssistant, setIsTyping } =
    useChat();

  const [message, setMessage] = useState("");
  const [files, setFiles] = useState([]);
  const [classification, setClassification] = useState("Public");
  const [dragActive, setDragActive] = useState(false);
  const [sending, setSending] = useState(false);
  const [voiceBusy, setVoiceBusy] = useState(false);

  const fileInputRef = useRef(null);

  const selectFiles = () => {
    if (!sending) {
      fileInputRef.current?.click();
    }
  };

  const onFilesSelected = (e) => {
    const selected = Array.from(e.target.files || []);

    if (selected.length > 0) {
      setFiles((prev) => [...prev, ...selected]);
    }

    e.target.value = "";
  };

  const removeFile = (index) => {
    setFiles((prev) => prev.filter((_, i) => i !== index));
  };

  const sendMessage = async () => {
    const question = message.trim();

    if (!question && files.length === 0) {
      return;
    }

    if (sending) {
      return;
    }

    setSending(true);

    try {
      let chatId = activeChat?.id;

      if (!chatId) {
        chatId = await createNewChat();

        if (!chatId) {
          return;
        }
      }

      if (files.length > 0) {
        for (const file of files) {
          const formData = new FormData();
          formData.append("file", file);
          formData.append("classification", classification);

          await uploadDocument(formData);
        }
      }

      if (!question) {
        setMessage("");
        setFiles([]);

        return;
      }

      await addMessage("user", question, chatId);

      setMessage("");
      setFiles([]);

      setIsTyping(true);

      await askAssistant(question, chatId);
    } catch (error) {
      console.error("Failed to send message:", error);

      const detail =
        error?.response?.data?.detail ||
        error?.message ||
        "Sorry, I couldn't process your request.";

      setIsTyping(false);

      alert(detail);
    } finally {
      setSending(false);
      setIsTyping(false);
    }
  };

  const onDragEnter = (e) => {
    e.preventDefault();
    if (sending || voiceBusy) {
      return;
    }
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

    if (sending || voiceBusy) {
      return;
    }

    const dropped = Array.from(e.dataTransfer.files || []);

    if (dropped.length > 0) {
      setFiles((prev) => [...prev, ...dropped]);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const hasContent = message.trim() || files.length > 0;

  const getClassificationStyle = () => {
    if (classification === "Secret") {
      return theme === "light"
        ? "bg-red-50 text-red-700 border-red-200"
        : "bg-red-500/10 text-red-400 border-red-500/20";
    }

    if (classification === "Confidential") {
      return theme === "light"
        ? "bg-yellow-50 text-yellow-700 border-yellow-200"
        : "bg-yellow-500/10 text-yellow-400 border-yellow-500/20";
    }

    return theme === "light"
      ? "bg-green-50 text-green-700 border-green-200"
      : "bg-green-500/10 text-green-400 border-green-500/20";
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
        className={`shrink-0 border-t px-4 pb-4 pt-3 sm:px-6 ${
          theme === "light"
            ? "border-gray-200 bg-white"
            : "border-white/10 bg-[#0B0B0B]"
        }`}
      >
        {/* Drag & Drop Indicator */}
        {dragActive && (
          <div
            className={`mb-3 flex items-center justify-center gap-2 rounded-xl border border-dashed py-3 text-sm ${
              theme === "light"
                ? "border-blue-400 bg-blue-50 text-blue-600"
                : "border-blue-500/50 bg-blue-500/10 text-blue-400"
            }`}
          >
            <Paperclip size={17} />
            Drop files here to attach
          </div>
        )}

        {/* Attachment Preview */}
        <AttachmentPreview files={files} removeFile={removeFile} />

        {/* Classification */}
        {files.length > 0 && (
          <div className="mb-3 flex flex-wrap items-center gap-3">
            <div
              className={`flex items-center gap-2 text-xs font-medium ${
                theme === "light" ? "text-gray-600" : "text-gray-400"
              }`}
            >
              <Shield size={15} />
              Document Classification
            </div>

            <div className="relative">
              <select
                value={classification}
                onChange={(e) => setClassification(e.target.value)}
                disabled={sending || voiceBusy}
                className={`appearance-none rounded-lg border py-1.5 pl-3 pr-8 text-xs font-medium outline-none transition ${getClassificationStyle()}`}
              >
                <option value="Public">Public</option>
                <option value="Confidential">Confidential</option>

                <option value="Secret">Secret</option>
              </select>

              <ChevronDown
                size={14}
                className="pointer-events-none absolute right-2 top-1/2 -translate-y-1/2"
              />
            </div>
          </div>
        )}

        {/* Main Composer */}
        <div
          className={`group relative rounded-2xl border transition-all duration-200 ${
            dragActive
              ? theme === "light"
                ? "border-blue-400 ring-4 ring-blue-500/10"
                : "border-blue-500 ring-4 ring-blue-500/10"
              : theme === "light"
                ? "border-gray-300 bg-white shadow-sm hover:border-gray-400 focus-within:border-gray-400 focus-within:shadow-md"
                : "border-white/10 bg-[#171717] shadow-sm hover:border-white/20 focus-within:border-white/20 focus-within:shadow-lg"
          }`}
        >
          {/* Text Area */}
          <div className="px-4 pt-3">
            <textarea
              rows={1}
              value={message}
              disabled={sending || voiceBusy}
              onChange={(e) => {
                setMessage(e.target.value);

                e.target.style.height = "0px";

                e.target.style.height = `${Math.min(
                  e.target.scrollHeight,
                  160,
                )}px`;
              }}
              onKeyDown={handleKeyDown}
              placeholder={
                voiceBusy
                  ? "Listening to your voice..."
                  : sending
                    ? "Generating response..."
                    : "Ask the DRDO AI Assistant..."
              }
              className={`max-h-40 min-h-[28px] w-full resize-none overflow-y-auto bg-transparent text-sm outline-none placeholder:text-gray-400 disabled:cursor-not-allowed disabled:opacity-60 sm:text-base ${
                theme === "light" ? "text-gray-900" : "text-gray-100"
              }`}
            />
          </div>

          {/* Bottom Toolbar */}
          <div className="flex items-center justify-between px-3 pb-3 pt-2">
            {/* Left Actions */}
            <div className="flex items-center gap-1">
              {/* Attachment */}
              <button
                type="button"
                onClick={selectFiles}
                disabled={sending || voiceBusy}
                className={`flex h-9 w-9 items-center justify-center rounded-lg transition ${
                  theme === "light"
                    ? "text-gray-500 hover:bg-gray-100 hover:text-gray-800"
                    : "text-gray-400 hover:bg-white/10 hover:text-white"
                } disabled:cursor-not-allowed disabled:opacity-40`}
                title={
                  voiceBusy ? "Unavailable while listening" : "Attach files"
                }
              >
                <Paperclip size={19} />
              </button>

              <input
                ref={fileInputRef}
                hidden
                multiple
                type="file"
                accept=".pdf,.doc,.docx,.xls,.xlsx,.csv,.txt,.png,.jpg,.jpeg"
                onChange={onFilesSelected}
              />

              {/* Voice */}
              <VoiceRecorder
                onVoiceBusyChange={setVoiceBusy}
                onTranscription={(text) => {
                  setMessage((prev) => {
                    const existing = prev.trim();

                    if (!existing) {
                      return text;
                    }

                    return `${existing} ${text}`;
                  });
                }}
              />
            </div>

            {/* Right Actions */}
            <div className="flex items-center gap-2">
              {/* AI indicator */}
              {!sending && (
                <div
                  className={`hidden items-center gap-1.5 text-[11px] sm:flex ${
                    theme === "light" ? "text-gray-400" : "text-gray-500"
                  }`}
                >
                  <Sparkles size={13} />
                  AI Ready
                </div>
              )}

              {/* Send */}
              <button
                type="button"
                onClick={sendMessage}
                disabled={sending || !hasContent || voiceBusy}
                className={`flex h-9 w-9 items-center justify-center rounded-xl transition-all duration-200 
                  ${
                    hasContent && !sending && !voiceBusy
                      ? "bg-blue-600 text-white shadow-md shadow-blue-600/20 hover:bg-blue-700 hover:shadow-lg"
                      : theme === "light"
                        ? "bg-gray-200 text-gray-400"
                        : "bg-white/10 text-gray-500"
                  } ${sending ? "cursor-not-allowed opacity-50" : ""}`}
                title={
                  voiceBusy ? "Unavailable while listening" : "Attach files"
                }
              >
                <SendHorizontal size={18} />
              </button>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div
          className={`mt-2 flex items-center justify-center gap-1.5 text-[10px] sm:text-xs ${
            theme === "light" ? "text-gray-400" : "text-gray-500"
          }`}
        >
          <Shield size={11} />

          <span>
            {sending
              ? "DRDO AI Assistant is processing your request..."
              : "Offline Defence Knowledge Assistant"}
          </span>

          {!sending && (
            <>
              <span>•</span>
              <span>Your data stays secure</span>
            </>
          )}
        </div>
      </div>
    </DropZone>
  );
}
