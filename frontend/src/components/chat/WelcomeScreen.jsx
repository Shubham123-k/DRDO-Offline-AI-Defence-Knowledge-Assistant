import { motion } from "framer-motion";
import { ShieldCheck, Sparkles, LockKeyhole } from "lucide-react";
import useTheme from "../../hooks/useTheme";

export default function WelcomeScreen() {
  const { theme } = useTheme();

  const isLight = theme === "light";

  return (
    <div
      className={`relative flex h-full w-full items-center justify-center overflow-hidden ${
        isLight
          ? "bg-white"
          : "bg-[#0B0B0B]"
      }`}
    >
      {/* Background Glow */}
      <div
        className={`pointer-events-none absolute left-1/2 top-1/2 h-[420px] w-[420px] -translate-x-1/2 -translate-y-1/2 rounded-full blur-3xl ${
          isLight
            ? "bg-blue-100/50"
            : "bg-blue-500/[0.06]"
        }`}
      />

      {/* Content */}
      <motion.div
        initial={{
          opacity: 0,
          y: 20,
        }}
        animate={{
          opacity: 1,
          y: 0,
        }}
        transition={{
          duration: 0.6,
          ease: "easeOut",
        }}
        className="relative z-10 flex max-w-3xl flex-col items-center px-6 text-center"
      >
        {/* AI Badge */}
        <motion.div
          initial={{
            opacity: 0,
            scale: 0.9,
          }}
          animate={{
            opacity: 1,
            scale: 1,
          }}
          transition={{
            duration: 0.5,
            delay: 0.1,
          }}
          className={`mb-7 flex items-center gap-2 rounded-full border px-4 py-2 text-sm font-medium shadow-sm ${
            isLight
              ? "border-blue-200 bg-blue-50 text-blue-700"
              : "border-blue-400/20 bg-blue-500/10 text-blue-400"
          }`}
        >
          <Sparkles size={15} />

          <span>
            Offline AI Defence Assistant
          </span>
        </motion.div>

        {/* Shield Icon */}
        <motion.div
          initial={{
            opacity: 0,
            scale: 0.8,
          }}
          animate={{
            opacity: 1,
            scale: 1,
          }}
          transition={{
            duration: 0.5,
            delay: 0.2,
          }}
          className={`mb-7 flex h-20 w-20 items-center justify-center rounded-3xl border shadow-lg ${
            isLight
              ? "border-gray-200 bg-white text-blue-600 shadow-blue-100"
              : "border-white/10 bg-[#171717] text-blue-400 shadow-black/30"
          }`}
        >
          <ShieldCheck size={38} strokeWidth={1.8} />
        </motion.div>

        {/* Main Heading */}
        <h1
          className={`text-4xl font-bold tracking-tight sm:text-5xl lg:text-6xl ${
            isLight
              ? "text-gray-950"
              : "text-white"
          }`}
        >
          DRDO AI Assistant
        </h1>

        {/* Accent Line */}
        <div
          className={`mt-5 h-1 w-16 rounded-full ${
            isLight
              ? "bg-blue-600"
              : "bg-blue-500"
          }`}
        />

        {/* Subtitle */}
        <p
          className={`mt-6 max-w-2xl text-lg leading-relaxed sm:text-xl ${
            isLight
              ? "text-gray-500"
              : "text-gray-400"
          }`}
        >
          How can I help you today?
        </p>

        {/* Security Information */}
        <div
          className={`mt-10 flex flex-wrap items-center justify-center gap-3 text-sm ${
            isLight
              ? "text-gray-500"
              : "text-gray-500"
          }`}
        >
          <div
            className={`flex items-center gap-2 rounded-xl border px-4 py-2.5 ${
              isLight
                ? "border-gray-200 bg-gray-50"
                : "border-white/10 bg-[#141414]"
            }`}
          >
            <LockKeyhole
              size={15}
              className={
                isLight
                  ? "text-blue-600"
                  : "text-blue-400"
              }
            />

            <span>
              Secure &amp; Private
            </span>
          </div>

          <div
            className={`rounded-xl border px-4 py-2.5 ${
              isLight
                ? "border-gray-200 bg-gray-50"
                : "border-white/10 bg-[#141414]"
            }`}
          >
            Local Processing
          </div>

          <div
            className={`rounded-xl border px-4 py-2.5 ${
              isLight
                ? "border-gray-200 bg-gray-50"
                : "border-white/10 bg-[#141414]"
            }`}
          >
            Defence Knowledge
          </div>
        </div>

        {/* Bottom Hint */}
        <p
          className={`mt-8 text-xs ${
            isLight
              ? "text-gray-400"
              : "text-gray-600"
          }`}
        >
          Start a new conversation from the sidebar
          to begin.
        </p>
      </motion.div>
    </div>
  );
}