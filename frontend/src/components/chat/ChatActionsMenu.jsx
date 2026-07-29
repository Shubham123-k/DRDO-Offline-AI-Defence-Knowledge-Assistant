import { MoreHorizontal, Pin, Pencil, Trash2 } from "lucide-react";
import { useState, useRef, useEffect } from "react";
import useTheme from "../../hooks/useTheme";

export default function ChatActionsMenu({ onPin, onRename, onDelete }) {
  const { theme } = useTheme();
  const [open, setOpen] = useState(false);
  const menuRef = useRef(null);

  useEffect(() => {
    const handleClick = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClick);

    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  return (
    <div ref={menuRef} className="relative">
      <button
        onClick={() => setOpen(!open)}
        className="rounded-lg p-1 hover:bg-gray-200 dark:hover:bg-[#2B2B2B]"
      >
        <MoreHorizontal size={18} />
      </button>

      {open && (
        <div
          className={`absolute right-0 z-50 mt-2 w-48 rounded-xl border shadow-xl transition-colors duration-300 ${
            theme === "light"
              ? "border-gray-200 bg-white"
              : "border-white/10 bg-[#202123]"
          }`}
        >
          <button
            onClick={onPin}
            className={`flex w-full items-center gap-3 px-4 py-3 transition-colors ${
  theme === "light"
    ? "text-gray-800 hover:bg-gray-100"
    : "text-white hover:bg-white/10"
}`}
          >
            <Pin size={16} />
            Pin Chat
          </button>
          <button
            onClick={onRename}
            className={`flex w-full items-center gap-3 px-4 py-3 transition-colors ${
  theme === "light"
    ? "text-gray-800 hover:bg-gray-100"
    : "text-white hover:bg-white/10"
}`}
          >
            <Pencil size={16} />
            Rename
          </button>
          <button
            onClick={onDelete}
            className={`flex w-full items-center gap-3 px-4 py-3 text-red-500 transition-colors ${
  theme === "light"
    ? "hover:bg-red-50"
    : "hover:bg-red-500/10"
}`}
          >
            <Trash2 size={16} />
            Delete
          </button>
        </div>
      )}
    </div>
  );
}
