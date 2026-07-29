import useTheme from "../../hooks/useTheme";

export default function HelpCard({
  title,
  children,
}) {
  const { theme } = useTheme();

  return (
    <div
      className={`rounded-3xl border p-8 backdrop-blur-xl transition-all duration-300 ${
        theme === "light"
          ? "border-gray-200 bg-white shadow-xl"
          : "border-white/10 bg-[#171717]/75"
      }`}
    >
      <h2 className="mb-8 text-3xl font-bold">
        {title}
      </h2>

      {children}
    </div>
  );
}