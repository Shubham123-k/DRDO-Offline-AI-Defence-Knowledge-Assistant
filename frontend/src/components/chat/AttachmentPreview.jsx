import { X, FileText, Image as ImageIcon, File } from "lucide-react";
import useTheme from "../../hooks/useTheme";

export default function AttachmentPreview({
  files,
  removeFile,
}) {
  const { theme } = useTheme();

  if (files.length === 0) return null;

  const formatFileSize = (bytes) => {
    if (!bytes) return "0 KB";

    const units = ["Bytes", "KB", "MB", "GB"];
    const index = Math.floor(
      Math.log(bytes) / Math.log(1024)
    );

    return `${(
      bytes / Math.pow(1024, index)
    ).toFixed(index === 0 ? 0 : 1)} ${
      units[index]
    }`;
  };

  const getFileExtension = (fileName) => {
    const parts = fileName.split(".");

    if (parts.length < 2) {
      return "FILE";
    }

    return parts.pop().toUpperCase();
  };

  return (
    <div className="mb-3 flex flex-wrap gap-3">
      {files.map((file, index) => {
        const isImage =
          file.type?.startsWith("image/");

        const extension =
          getFileExtension(file.name);

        const imageUrl = isImage
          ? URL.createObjectURL(file)
          : null;

        return (
          <div
            key={`${file.name}-${index}`}
            className={`group relative flex w-[270px] items-center gap-3 overflow-hidden rounded-2xl border p-2.5 shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md ${
              theme === "light"
                ? "border-gray-200 bg-white hover:border-gray-300"
                : "border-white/10 bg-[#202123] hover:border-white/20"
            }`}
          >
            {/* File preview */}
            <div
              className={`flex h-12 w-12 shrink-0 items-center justify-center overflow-hidden rounded-xl ${
                isImage
                  ? theme === "light"
                    ? "bg-gray-100"
                    : "bg-[#171717]"
                  : extension === "PDF"
                  ? theme === "light"
                    ? "bg-red-50 text-red-600"
                    : "bg-red-500/10 text-red-400"
                  : theme === "light"
                  ? "bg-blue-50 text-blue-600"
                  : "bg-blue-500/10 text-blue-400"
              }`}
            >
              {isImage ? (
                <img
                  src={imageUrl}
                  alt={file.name}
                  className="h-full w-full object-cover"
                />
              ) : extension === "PDF" ? (
                <FileText size={21} />
              ) : (
                <File size={21} />
              )}
            </div>

            {/* File information */}
            <div className="min-w-0 flex-1">
              <p
                title={file.name}
                className={`truncate text-sm font-medium ${
                  theme === "light"
                    ? "text-gray-900"
                    : "text-white"
                }`}
              >
                {file.name}
              </p>

              <div className="mt-1 flex items-center gap-2">
                <span
                  className={`text-[10px] font-semibold uppercase tracking-wider ${
                    theme === "light"
                      ? "text-gray-500"
                      : "text-gray-500"
                  }`}
                >
                  {extension}
                </span>

                <span
                  className={`h-1 w-1 rounded-full ${
                    theme === "light"
                      ? "bg-gray-300"
                      : "bg-gray-600"
                  }`}
                />

                <span
                  className={`text-xs ${
                    theme === "light"
                      ? "text-gray-500"
                      : "text-gray-500"
                  }`}
                >
                  {formatFileSize(file.size)}
                </span>
              </div>
            </div>

            {/* Remove button */}
            <button
              type="button"
              onClick={() => removeFile(index)}
              aria-label={`Remove ${file.name}`}
              title="Remove attachment"
              className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-full opacity-70 transition-all duration-200 group-hover:opacity-100 ${
                theme === "light"
                  ? "text-gray-500 hover:bg-gray-100 hover:text-gray-900"
                  : "text-gray-400 hover:bg-white/10 hover:text-white"
              }`}
            >
              <X size={16} />
            </button>

            {/* Bottom accent */}
            <div
              className={`absolute bottom-0 left-0 h-[2px] w-0 transition-all duration-300 group-hover:w-full ${
                isImage
                  ? "bg-purple-500"
                  : extension === "PDF"
                  ? "bg-red-500"
                  : "bg-blue-500"
              }`}
            />
          </div>
        );
      })}
    </div>
  );
}