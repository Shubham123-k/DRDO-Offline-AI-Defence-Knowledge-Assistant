import { MoreHorizontal, Pin, Pencil, Trash2, ChevronRight } from "lucide-react";
import { useState, useRef, useEffect } from "react";
import useTheme from "../../hooks/useTheme";

export default function ChatActionsMenu({
  onPin,
  onRename,
  onDelete,
}) {
  const { theme } = useTheme();

  const [open, setOpen] = useState(false);
  const menuRef = useRef(null);

  useEffect(() => {
    const handleClick = (event) => {
      if (
        menuRef.current &&
        !menuRef.current.contains(event.target)
      ) {
        setOpen(false);
      }
    };

    document.addEventListener(
      "mousedown",
      handleClick
    );

    return () =>
      document.removeEventListener(
        "mousedown",
        handleClick
      );
  }, []);

  const handleAction = (action) => {
    setOpen(false);
    action?.();
  };

  return (
    <div
      ref={menuRef}
      className="relative"
    >
      {/* Menu button */}
      <button
        type="button"
        onClick={() => setOpen((prev) => !prev)}
        aria-label="Chat actions"
        aria-expanded={open}
        className={`flex h-8 w-8 items-center justify-center rounded-lg transition-all duration-200 ${
          open
            ? theme === "light"
              ? "bg-gray-200 text-gray-900"
              : "bg-white/10 text-white"
            : theme === "light"
            ? "text-gray-500 hover:bg-gray-100 hover:text-gray-900"
            : "text-gray-400 hover:bg-white/10 hover:text-white"
        }`}
      >
        <MoreHorizontal size={18} />
      </button>

      {/* Dropdown */}
      {open && (
        <div
          className={`absolute right-0 z-50 mt-2 w-52 origin-top-right overflow-hidden rounded-xl border p-1.5 shadow-2xl backdrop-blur-xl ${
            theme === "light"
              ? "border-gray-200 bg-white/95 shadow-gray-300/40"
              : "border-white/10 bg-[#202123]/95 shadow-black/40"
          }`}
        >
          {/* Header */}
          <div
            className={`px-3 py-2 text-[11px] font-semibold uppercase tracking-wider ${
              theme === "light"
                ? "text-gray-400"
                : "text-gray-500"
            }`}
          >
            Chat actions
          </div>

          {/* Pin */}
          <button
            type="button"
            onClick={() => handleAction(onPin)}
            className={`group flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm transition-all duration-150 ${
              theme === "light"
                ? "text-gray-700 hover:bg-gray-100 hover:text-gray-900"
                : "text-gray-200 hover:bg-white/10 hover:text-white"
            }`}
          >
            <span
              className={`flex h-8 w-8 items-center justify-center rounded-lg transition-colors ${
                theme === "light"
                  ? "bg-gray-100 text-gray-500 group-hover:bg-gray-200 group-hover:text-gray-800"
                  : "bg-white/5 text-gray-400 group-hover:bg-white/10 group-hover:text-white"
              }`}
            >
              <Pin size={16} />
            </span>

            <span className="flex-1 text-left">
              Pin Chat
            </span>

            <ChevronRight
              size={15}
              className={`opacity-0 transition-opacity group-hover:opacity-50 ${
                theme === "light"
                  ? "text-gray-500"
                  : "text-gray-400"
              }`}
            />
          </button>

          {/* Rename */}
          <button
            type="button"
            onClick={() => handleAction(onRename)}
            className={`group flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm transition-all duration-150 ${
              theme === "light"
                ? "text-gray-700 hover:bg-gray-100 hover:text-gray-900"
                : "text-gray-200 hover:bg-white/10 hover:text-white"
            }`}
          >
            <span
              className={`flex h-8 w-8 items-center justify-center rounded-lg transition-colors ${
                theme === "light"
                  ? "bg-gray-100 text-gray-500 group-hover:bg-gray-200 group-hover:text-gray-800"
                  : "bg-white/5 text-gray-400 group-hover:bg-white/10 group-hover:text-white"
              }`}
            >
              <Pencil size={15} />
            </span>

            <span className="flex-1 text-left">
              Rename
            </span>

            <ChevronRight
              size={15}
              className={`opacity-0 transition-opacity group-hover:opacity-50 ${
                theme === "light"
                  ? "text-gray-500"
                  : "text-gray-400"
              }`}
            />
          </button>

          {/* Divider */}
          <div
            className={`my-1 border-t ${
              theme === "light"
                ? "border-gray-100"
                : "border-white/5"
            }`}
          />

          {/* Delete */}
          <button
            type="button"
            onClick={() => handleAction(onDelete)}
            className={`group flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm transition-all duration-150 ${
              theme === "light"
                ? "text-red-600 hover:bg-red-50"
                : "text-red-400 hover:bg-red-500/10"
            }`}
          >
            <span
              className={`flex h-8 w-8 items-center justify-center rounded-lg transition-colors ${
                theme === "light"
                  ? "bg-red-50 group-hover:bg-red-100"
                  : "bg-red-500/10 group-hover:bg-red-500/20"
              }`}
            >
              <Trash2 size={16} />
            </span>

            <span className="flex-1 text-left">
              Delete
            </span>

            <ChevronRight
              size={15}
              className="opacity-0 transition-opacity group-hover:opacity-50"
            />
          </button>
        </div>
      )}
    </div>
  );
}