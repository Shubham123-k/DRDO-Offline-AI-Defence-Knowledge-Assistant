import { ShieldCheck, Circle } from "lucide-react";
import ThemeToggle from "../common/ThemeToggle";
import useTheme from "../../hooks/useTheme";

export default function ChatHeader() {
  const { theme } = useTheme();

  return (
    <header
      className={`relative flex items-center justify-between border-b px-6 py-4 transition-colors duration-300 sm:px-8 ${
        theme === "light"
          ? "border-gray-200 bg-white"
          : "border-white/10 bg-[#171717]"
      }`}
    >
      {/* Left Section */}
      <div className="flex items-center gap-4">

        {/* Security Icon */}
        <div
          className={`flex h-11 w-11 items-center justify-center rounded-xl border ${
            theme === "light"
              ? "border-blue-100 bg-blue-50 text-blue-600"
              : "border-blue-500/20 bg-blue-500/10 text-blue-400"
          }`}
        >
          <ShieldCheck size={23} />
        </div>

        {/* Title */}
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-bold tracking-tight sm:text-2xl">
              DRDO AI Assistant
            </h1>

            {/* Online/Active indicator */}
            <span
              className={`flex items-center gap-1.5 rounded-full px-2 py-0.5 text-[10px] font-medium uppercase tracking-wide ${
                theme === "light"
                  ? "bg-green-50 text-green-600"
                  : "bg-green-500/10 text-green-400"
              }`}
            >
              <Circle
                size={6}
                fill="currentColor"
                strokeWidth={0}
              />
              Offline
            </span>
          </div>

          <p
            className={`mt-0.5 text-xs sm:text-sm ${
              theme === "light"
                ? "text-gray-500"
                : "text-gray-400"
            }`}
          >
            Offline AI Defence Knowledge Assistant
          </p>
        </div>
      </div>

      {/* Right Section */}
      <div className="flex items-center gap-3">

        {/* Security Status */}
        <div
          className={`hidden items-center gap-2 rounded-lg border px-3 py-2 text-xs sm:flex ${
            theme === "light"
              ? "border-gray-200 bg-gray-50 text-gray-600"
              : "border-white/10 bg-white/[0.03] text-gray-400"
          }`}
        >
          <ShieldCheck size={15} />
          <span>Secure Session</span>
        </div>

        {/* Theme Toggle */}
        <div
          className={`rounded-xl border p-1 ${
            theme === "light"
              ? "border-gray-200 bg-gray-50"
              : "border-white/10 bg-white/[0.03]"
          }`}
        >
          <ThemeToggle />
        </div>
      </div>
    </header>
  );
}