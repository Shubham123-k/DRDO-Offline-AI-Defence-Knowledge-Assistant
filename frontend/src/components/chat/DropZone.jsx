import {
  UploadCloud,
  FileText,
  Image,
  FileSpreadsheet,
  ShieldCheck,
} from "lucide-react";

import useTheme from "../../hooks/useTheme";

export default function DropZone({
  dragActive,
  children,
  onDragEnter,
  onDragLeave,
  onDragOver,
  onDrop,
}) {
  const { theme } = useTheme();

  return (
    <div
      onDragEnter={onDragEnter}
      onDragLeave={onDragLeave}
      onDragOver={onDragOver}
      onDrop={onDrop}
      className={`relative w-full transition-all duration-300 ${
        dragActive
          ? theme === "light"
            ? "bg-blue-50/40"
            : "bg-blue-500/[0.03]"
          : ""
      }`}
    >
      {children}

      {dragActive && (
        <div
          className={`absolute inset-0 z-50 flex items-center justify-center p-6 backdrop-blur-sm transition-all duration-300 ${
            theme === "light"
              ? "bg-white/80"
              : "bg-[#0B0B0B]/85"
          }`}
        >
          {/* Drop area */}
          <div
            className={`relative flex w-full max-w-2xl flex-col items-center justify-center rounded-3xl border-2 border-dashed px-8 py-12 text-center shadow-2xl transition-all duration-300 ${
              theme === "light"
                ? "border-blue-400 bg-blue-50/80 shadow-blue-100"
                : "border-blue-500/60 bg-blue-500/[0.06] shadow-blue-950/20"
            }`}
          >
            {/* Decorative glow */}
            <div className="pointer-events-none absolute inset-0 overflow-hidden rounded-3xl">
              <div
                className={`absolute left-1/2 top-1/2 h-48 w-48 -translate-x-1/2 -translate-y-1/2 rounded-full blur-3xl ${
                  theme === "light"
                    ? "bg-blue-200/50"
                    : "bg-blue-500/10"
                }`}
              />
            </div>

            {/* Upload icon */}
            <div
              className={`relative mb-5 flex h-20 w-20 items-center justify-center rounded-3xl ${
                theme === "light"
                  ? "bg-blue-100 text-blue-600"
                  : "bg-blue-500/10 text-blue-400"
              }`}
            >
              <UploadCloud
                size={42}
                strokeWidth={1.7}
              />

              {/* Small status badge */}
              <div className="absolute -right-1 -top-1 flex h-7 w-7 items-center justify-center rounded-full bg-blue-600 text-white shadow-lg">
                <ShieldCheck size={15} />
              </div>
            </div>

            {/* Heading */}
            <h2 className="relative text-2xl font-bold tracking-tight">
              Drop files here
            </h2>

            <p
              className={`relative mt-2 max-w-md text-sm leading-6 ${
                theme === "light"
                  ? "text-gray-500"
                  : "text-gray-400"
              }`}
            >
              Release your files to upload them to the
              DRDO AI Assistant.
            </p>

            {/* Supported file types */}
            <div className="relative mt-7 flex flex-wrap justify-center gap-2">
              <span
                className={`flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs font-medium ${
                  theme === "light"
                    ? "border-gray-200 bg-white text-gray-600"
                    : "border-white/10 bg-white/[0.04] text-gray-300"
                }`}
              >
                <FileText size={13} />
                PDF
              </span>

              <span
                className={`flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs font-medium ${
                  theme === "light"
                    ? "border-gray-200 bg-white text-gray-600"
                    : "border-white/10 bg-white/[0.04] text-gray-300"
                }`}
              >
                <FileText size={13} />
                DOCX
              </span>

              <span
                className={`flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs font-medium ${
                  theme === "light"
                    ? "border-gray-200 bg-white text-gray-600"
                    : "border-white/10 bg-white/[0.04] text-gray-300"
                }`}
              >
                <Image size={13} />
                Images
              </span>

              <span
                className={`flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs font-medium ${
                  theme === "light"
                    ? "border-gray-200 bg-white text-gray-600"
                    : "border-white/10 bg-white/[0.04] text-gray-300"
                }`}
              >
                <FileSpreadsheet size={13} />
                Excel
              </span>

              <span
                className={`flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs font-medium ${
                  theme === "light"
                    ? "border-gray-200 bg-white text-gray-600"
                    : "border-white/10 bg-white/[0.04] text-gray-300"
                }`}
              >
                <FileSpreadsheet size={13} />
                CSV
              </span>
            </div>

            {/* Security note */}
            <div
              className={`relative mt-7 flex items-center gap-2 rounded-xl px-4 py-2.5 text-xs ${
                theme === "light"
                  ? "bg-white text-gray-500 shadow-sm"
                  : "bg-white/[0.04] text-gray-400"
              }`}
            >
              <ShieldCheck
                size={15}
                className="text-blue-500"
              />

              <span>
                Files are processed by the offline
                defence knowledge system.
              </span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}