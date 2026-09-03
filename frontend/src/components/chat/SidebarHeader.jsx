import Logo from "../common/Logo";
import { PanelLeft, ShieldCheck } from "lucide-react";
import useTheme from "../../hooks/useTheme";

export default function SidebarHeader({
  collapsed,
  onToggle,
}) {
  const { theme } = useTheme();
  const isLight = theme === "light";

  return (
    <div
      className={`group relative shrink-0 border-b transition-colors duration-300 ${
        collapsed
          ? "px-2 py-4"
          : "px-4 py-4"
      } ${
        isLight
          ? "border-gray-200"
          : "border-white/[0.08]"
      }`}
    >
      {/* HEADER */}
      <div
        className={`relative flex items-center ${
          collapsed
            ? "justify-center"
            : "justify-between"
        }`}
      >
        {/* LOGO */}
        <div
          className={`flex shrink-0 items-center transition-all duration-300 ${
            collapsed
              ? "justify-center"
              : "min-w-0"
          }`}
        >
          <Logo
            className={`w-auto transition-all duration-300 ${
              collapsed
                ? "h-11"
                : "h-11"
            }`}
          />
        </div>

        {/* TOGGLE BUTTON - EXPANDED */}
        {!collapsed && (
          <button
            type="button"
            onClick={onToggle}
            aria-label="Close sidebar"
            title="Close sidebar"
            className={`group/toggle flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border transition-all duration-200 ${
              isLight
                ? "border-gray-200 bg-white text-gray-600 hover:border-gray-300 hover:bg-gray-100 hover:text-gray-900"
                : "border-white/[0.08] bg-[#18191a] text-gray-400 hover:border-white/[0.15] hover:bg-[#222324] hover:text-white"
            }`}
          >
            <PanelLeft
              size={18}
              strokeWidth={1.8}
              className="transition-transform duration-200 group-hover/toggle:scale-105"
            />

            {/* ChatGPT-like tooltip */}
            <span
              className={`pointer-events-none absolute left-full top-1/2 z-[100] ml-3 -translate-y-1/2 whitespace-nowrap rounded-xl border px-3 py-2 text-xs font-medium opacity-0 shadow-xl transition-all duration-200 group-hover/toggle:translate-x-1 group-hover/toggle:opacity-100 ${
                isLight
                  ? "border-gray-200 bg-white text-gray-800"
                  : "border-white/10 bg-[#202123] text-white"
              }`}
            >
              Close sidebar
            </span>
          </button>
        )}

        {collapsed && (
          <button
            type="button"
            onClick={onToggle}
            aria-label="Open sidebar"
            title="Open sidebar"
            className={`absolute left-1/2 top-1/2 z-50 flex h-9 w-9 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-lg border opacity-0 transition-all duration-200 group-hover:opacity-100 ${
              isLight
                ? "border-gray-200 bg-white text-gray-700 shadow-lg hover:bg-gray-50"
                : "border-white/[0.10] bg-[#202123] text-gray-200 shadow-xl hover:bg-[#2a2b2c]"
            }`}
          >
            <PanelLeft
              size={18}
              strokeWidth={1.8}
            />

            {/* ChatGPT-like tooltip */}
            <span
              className={`pointer-events-none absolute left-full top-1/2 ml-3 -translate-y-1/2 whitespace-nowrap rounded-xl border px-3 py-2 text-xs font-medium opacity-0 shadow-xl transition-all duration-200 group-hover:translate-x-1 group-hover:opacity-100 ${
                isLight
                  ? "border-gray-200 bg-white text-gray-800"
                  : "border-white/10 bg-[#202123] text-white"
              }`}
            >
              Open sidebar
            </span>
          </button>
        )}
      </div>

      {!collapsed && (
        <div className="mt-3 flex items-center gap-2 px-1">
          <div
            className={`flex h-6 w-6 items-center justify-center rounded-md ${
              isLight
                ? "bg-green-50 text-green-600"
                : "bg-green-500/10 text-green-400"
            }`}
          >
            <ShieldCheck size={13} />
          </div>

          <div className="flex min-w-0 items-center gap-1.5">
            <span
              className={`h-1.5 w-1.5 rounded-full ${
                isLight
                  ? "bg-green-500"
                  : "bg-green-400"
              }`}
            />

            <span
              className={`truncate text-[10px] font-medium ${
                isLight
                  ? "text-gray-500"
                  : "text-gray-500"
              }`}
            >
              Offline Secure Environment
            </span>
          </div>
        </div>
      )}
    </div>
  );
}