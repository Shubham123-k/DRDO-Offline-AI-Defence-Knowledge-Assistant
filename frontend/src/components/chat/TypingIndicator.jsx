import { motion } from "framer-motion";
import { Sparkles } from "lucide-react";
import useTheme from "../../hooks/useTheme";

export default function TypingIndicator() {
  const { theme } = useTheme();

  const isLight = theme === "light";

  return (
    <div className="mb-6 flex justify-start px-1">
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.2 }}
        className={`flex items-center gap-3 rounded-2xl border px-4 py-3 shadow-sm ${
          isLight
            ? "border-gray-200 bg-white"
            : "border-white/10 bg-[#181818]"
        }`}
      >
        {/* AI Icon */}
        <div
          className={`flex h-9 w-9 items-center justify-center rounded-xl ${
            isLight
              ? "bg-blue-50 text-blue-600"
              : "bg-blue-500/10 text-blue-400"
          }`}
        >
          <Sparkles size={17} />
        </div>

        {/* Thinking Content */}
        <div className="flex flex-col gap-1">
          <span
            className={`text-xs font-medium ${
              isLight
                ? "text-gray-500"
                : "text-gray-400"
            }`}
          >
            DRDO AI Assistant
          </span>

          <div className="flex items-center gap-1.5">
            <span
              className={`text-sm ${
                isLight
                  ? "text-gray-700"
                  : "text-gray-300"
              }`}
            >
              Thinking
            </span>

            {/* Animated Dots */}
            <div className="flex items-center gap-1">
              {[0, 1, 2].map((index) => (
                <motion.span
                  key={index}
                  className={`h-1.5 w-1.5 rounded-full ${
                    isLight
                      ? "bg-blue-500"
                      : "bg-blue-400"
                  }`}
                  animate={{
                    opacity: [0.25, 1, 0.25],
                    scale: [0.8, 1.15, 0.8],
                  }}
                  transition={{
                    duration: 1,
                    repeat: Infinity,
                    delay: index * 0.18,
                    ease: "easeInOut",
                  }}
                />
              ))}
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
}