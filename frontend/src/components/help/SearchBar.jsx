import { Search } from "lucide-react";
import useTheme from "../../hooks/useTheme";

export default function SearchBar({
  value,
  onChange,
}) {
  const { theme } = useTheme();

  return (
    <div className="relative">

      <Search
        size={22}
        className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-400"
      />

      <input
        value={value}
        onChange={onChange}
        placeholder="Search help articles..."
        className={`w-full rounded-2xl border py-4 pl-14 pr-5 text-lg outline-none transition-all duration-300 ${
          theme === "light"
            ? "border-gray-300 bg-white focus:border-blue-500"
            : "border-white/10 bg-[#111111] focus:border-blue-500"
        }`}
      />

    </div>
  );
}