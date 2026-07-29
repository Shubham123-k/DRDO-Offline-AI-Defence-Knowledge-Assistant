import useTheme from "../../hooks/useTheme";

export default function WelcomeScreen() {
  const { theme } = useTheme();

  return (
    <div className="flex h-full w-full items-center justify-center">
      <div className="text-center">
        <h1
          className={`text-6xl font-bold ${
            theme === "light"
              ? "text-black"
              : "text-white"
          }`}
        >
          DRDO AI Assistant
        </h1>

        <p
          className={`mt-5 text-2xl ${
            theme === "light"
              ? "text-gray-500"
              : "text-gray-400"
          }`}
        >
          How can I help you today?
        </p>
      </div>
    </div>
  );
}