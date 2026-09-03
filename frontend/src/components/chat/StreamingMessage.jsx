import { motion } from "framer-motion";
import { Bot } from "lucide-react";
import useTheme from "../../hooks/useTheme";

export default function StreamingMessage({ text }) {
  const { theme } = useTheme();

  const isLight = theme === "light";

  return (
    <div className="mb-6 flex w-full justify-start">
      <div className="flex max-w-[85%] items-start gap-3">

        {/* Assistant Avatar */}
        <div
          className={`mt-1 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border ${
            isLight
              ? "border-gray-200 bg-white text-gray-600 shadow-sm"
              : "border-white/[0.08] bg-[#18191a] text-gray-300"
          }`}
        >
          <Bot
            size={16}
            strokeWidth={1.8}
          />
        </div>

        {/* Streaming Message */}
        <div
          className={`relative rounded-2xl rounded-tl-md border px-5 py-4 shadow-sm transition-colors duration-300 ${
            isLight
              ? "border-gray-200 bg-gray-50 text-gray-900"
              : "border-white/[0.08] bg-[#1c1d1e] text-gray-100"
          }`}
        >
          {/* Small assistant label */}
          <div
            className={`mb-2 flex items-center gap-2 text-[10px] font-semibold uppercase tracking-wider ${
              isLight
                ? "text-gray-400"
                : "text-gray-500"
            }`}
          >
            <span
              className={`h-1.5 w-1.5 rounded-full ${
                isLight
                  ? "bg-blue-500"
                  : "bg-blue-400"
              }`}
            />

            DRDO AI Assistant
          </div>

          {/* Streaming Text */}
          <div className="whitespace-pre-wrap break-words text-[15px] leading-7">
            {text}

            {/* Animated Cursor */}
            <motion.span
              aria-hidden="true"
              animate={{
                opacity: [0, 1, 0],
              }}
              transition={{
                repeat: Infinity,
                duration: 0.9,
                ease: "easeInOut",
              }}
              className={`ml-1 inline-block font-medium ${
                isLight
                  ? "text-blue-600"
                  : "text-blue-400"
              }`}
            >
              ▌
            </motion.span>
          </div>

          {/* Streaming indicator */}
          <div
            className={`mt-3 flex items-center gap-2 border-t pt-2 text-[10px] ${
              isLight
                ? "border-gray-200 text-gray-400"
                : "border-white/[0.06] text-gray-500"
            }`}
          >
            <motion.span
              animate={{
                opacity: [0.4, 1, 0.4],
              }}
              transition={{
                repeat: Infinity,
                duration: 1.4,
                ease: "easeInOut",
              }}
              className="h-1.5 w-1.5 rounded-full bg-blue-500"
            />

            Generating response...
          </div>
        </div>
      </div>
    </div>
  );
}