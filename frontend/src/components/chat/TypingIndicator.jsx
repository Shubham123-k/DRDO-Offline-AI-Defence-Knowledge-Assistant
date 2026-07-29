import useTheme from "../../hooks/useTheme";

export default function TypingIndicator() {
  const { theme } = useTheme();

  return (
    <div className="mb-6 flex justify-start">
      <div
        className={`rounded-2xl px-5 py-4 ${
          theme === "light"
            ? "border border-gray-200 bg-gray-100"
            : "bg-[#202123]"
        }`}
      >
        <div className="flex gap-2">
          <span
            className={`h-2 w-2 animate-bounce rounded-full ${
              theme === "light" ? "bg-gray-600" : "bg-gray-400"
            }`}
          />
          <span
            className={`h-2 w-2 animate-bounce rounded-full ${
              theme === "light" ? "bg-gray-600" : "bg-gray-400"
            }`}
            style={{ animationDelay: "0.2s" }}
          />
          <span
            className={`h-2 w-2 animate-bounce rounded-full ${
              theme === "light" ? "bg-gray-600" : "bg-gray-400"
            }`}
            style={{ animationDelay: "0.4s" }}
          />
        </div>
      </div>
    </div>
  );
}