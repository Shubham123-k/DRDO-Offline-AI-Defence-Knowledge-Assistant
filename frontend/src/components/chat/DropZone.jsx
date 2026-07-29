import { UploadCloud } from "lucide-react";
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
      className={`relative w-full transition-all duration-200 ${
        dragActive
          ? theme === "light"
            ? "bg-blue-50"
            : "bg-blue-500/10"
          : ""
      }`}
    >
      {children}

      {dragActive && (
        <div
          className={`absolute inset-0 z-50 flex flex-col items-center justify-center border-2 border-dashed ${
            theme === "light"
              ? "border-blue-500 bg-blue-50/90"
              : "border-blue-400 bg-[#111]/90"
          }`}
        >
          <UploadCloud
            size={60}
            className="mb-4 text-blue-500"
          />

          <h2 className="text-2xl font-bold">
            Drop files here
          </h2>

          <p className="mt-2 text-gray-500">
            PDF • DOCX • Images • Excel • CSV
          </p>
        </div>
      )}
    </div>
  );
}