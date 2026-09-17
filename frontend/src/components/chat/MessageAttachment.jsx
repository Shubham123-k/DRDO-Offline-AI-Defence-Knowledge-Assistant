import { useEffect, useState } from "react";
import {
  Download,
  File,
  FileText,
  Image as ImageIcon,
  LoaderCircle,
} from "lucide-react";
import useTheme from "../../hooks/useTheme";
import api from "../../api/axios";

function formatFileSize(bytes) {
  if (!bytes) return "";
  const units = ["Bytes", "KB", "MB", "GB"];
  const index = Math.min(
    Math.floor(Math.log(bytes) / Math.log(1024)),
    units.length - 1,
  );
  return `${(bytes / Math.pow(1024, index)).toFixed(index === 0 ? 0 : 1)} ${units[index]}`;
}

export default function MessageAttachment({ attachment }) {
  const { theme } = useTheme();
  const [objectUrl, setObjectUrl] = useState(null);
  const [loading, setLoading] = useState(false);

  const id = Number(attachment?.document_id);
  const filename = attachment?.filename || "Attachment";
  const extension = (
    attachment?.file_type || filename.split(".").pop() || "FILE"
  ).replace(".", "").toUpperCase();
  const isImage = ["JPG", "JPEG", "PNG", "WEBP", "AVIF", "BMP", "GIF", "TIF", "TIFF"].includes(extension);

  useEffect(() => {
    let active = true;
    let url = null;

    if (!id || !isImage) return undefined;

    setLoading(true);
    api
      .get(`/documents/download/${id}`, { responseType: "blob" })
      .then((response) => {
        if (!active) return;
        url = URL.createObjectURL(response.data);
        setObjectUrl(url);
      })
      .catch(() => {
        if (active) setObjectUrl(null);
      })
      .finally(() => {
        if (active) setLoading(false);
      });

    return () => {
      active = false;
      if (url) URL.revokeObjectURL(url);
    };
  }, [id, isImage]);

  const download = async () => {
    if (!id) return;

    try {
      const response = await api.get(`/documents/download/${id}`, {
        responseType: "blob",
      });
      const url = URL.createObjectURL(response.data);
      const link = document.createElement("a");
      link.href = url;
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      link.remove();
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error("Attachment download failed:", error);
    }
  };

  const iconClass =
    extension === "PDF"
      ? theme === "light"
        ? "bg-red-50 text-red-600"
        : "bg-red-500/10 text-red-400"
      : theme === "light"
        ? "bg-blue-50 text-blue-600"
        : "bg-blue-500/10 text-blue-400";

  return (
    <div
      className={`mt-2 w-full max-w-sm overflow-hidden rounded-xl border ${
        theme === "light"
          ? "border-white/20 bg-white/10"
          : "border-white/10 bg-black/10"
      }`}
    >
      {isImage && objectUrl ? (
        <img
          src={objectUrl}
          alt={filename}
          className="block max-h-72 w-full object-contain bg-black/10"
        />
      ) : isImage && loading ? (
        <div className="flex h-36 items-center justify-center">
          <LoaderCircle size={20} className="animate-spin opacity-70" />
        </div>
      ) : null}

      <div className="flex items-center gap-3 p-3">
        <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-lg ${iconClass}`}>
          {isImage ? <ImageIcon size={19} /> : extension === "PDF" ? <FileText size={19} /> : <File size={19} />}
        </div>

        <div className="min-w-0 flex-1">
          <p className="truncate text-sm font-semibold" title={filename}>
            {filename}
          </p>
          <p className="mt-0.5 text-[11px] opacity-70">
            {extension}
            {attachment?.size ? ` • ${formatFileSize(attachment.size)}` : ""}
            {" • Attached"}
          </p>
        </div>

        <button
          type="button"
          onClick={download}
          className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg opacity-80 transition hover:bg-black/10 hover:opacity-100"
          title="Download attachment"
          aria-label={`Download ${filename}`}
        >
          <Download size={16} />
        </button>
      </div>
    </div>
  );
}
