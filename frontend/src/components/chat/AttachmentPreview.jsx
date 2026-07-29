import { X, FileText, Image as ImageIcon } from "lucide-react";
import useTheme from "../../hooks/useTheme";

export default function AttachmentPreview({
  files,
  removeFile,
}) {
  const { theme } = useTheme();

  if (files.length === 0) return null;

  return (
    <div className="mb-3 flex flex-wrap gap-3">
      {files.map((file, index) => {
        const isImage = file.type.startsWith("image/");

        return (
          <div
            key={index}
            className={`flex items-center gap-3 rounded-xl border px-3 py-2 shadow-sm transition-colors ${
              theme === "light"
                ? "border-gray-300 bg-gray-100 text-gray-900"
                : "border-white/10 bg-[#202123] text-white"
            }`}
          >
            {isImage ? (
              <ImageIcon size={18} />
            ) : (
              <FileText size={18} />
            )}

            <span className="max-w-[180px] truncate">
              {file.name}
            </span>

            <button
              onClick={() => removeFile(index)}
              className={`rounded-full p-1 transition ${
                theme === "light"
                  ? "hover:bg-gray-200"
                  : "hover:bg-white/10"
              }`}
            >
              <X size={16} />
            </button>
          </div>
        );
      })}
    </div>
  );
}