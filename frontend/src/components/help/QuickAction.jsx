import useTheme from "../../hooks/useTheme";

export default function QuickAction({
  icon,
  title,
  subtitle,
  onClick,
}) {
  const { theme } = useTheme();

  return (
    <button
      onClick={onClick}
      className={`group rounded-3xl border p-8 text-left transition-all duration-300 hover:-translate-y-2 ${
        theme === "light"
          ? "border-gray-200 bg-white shadow-lg hover:border-blue-500 hover:shadow-xl"
          : "border-white/10 bg-[#171717]/70 backdrop-blur-xl hover:border-blue-500 hover:bg-white/10"
      }`}
    >
      <div
        className={`mb-6 flex h-16 w-16 items-center justify-center rounded-2xl transition-all ${
          theme === "light"
            ? "bg-blue-100 text-blue-600 group-hover:bg-blue-600 group-hover:text-white"
            : "bg-blue-500/10 text-blue-400 group-hover:bg-blue-600 group-hover:text-white"
        }`}
      >
        {icon}
      </div>

      <h3 className="text-2xl font-bold">
        {title}
      </h3>

      <p
        className={`mt-3 ${
          theme === "light"
            ? "text-gray-500"
            : "text-gray-400"
        }`}
      >
        {subtitle}
      </p>
    </button>
  );
}