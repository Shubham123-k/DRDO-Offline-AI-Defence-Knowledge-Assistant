import { motion } from "framer-motion";
import useTheme from "../../hooks/useTheme";

export default function StreamingMessage({ text }) {
  const { theme } = useTheme();

  return (
    <div className="mb-6 flex justify-start">
      <div
        className={`max-w-[80%] rounded-2xl border px-5 py-4 shadow-sm ${
          theme === "light"
            ? "border-gray-200 bg-gray-100 text-gray-900"
            : "border-white/10 bg-[#202123] text-white"
        }`}
      >
        <span>{text}</span>

        <motion.span
          animate={{ opacity: [0, 1, 0] }}
          transition={{
            repeat: Infinity,
            duration: 1,
          }}
        >
          ▌
        </motion.span>
      </div>
    </div>
  );
}