import { ChevronDown } from "lucide-react";
import { useState } from "react";
import useTheme from "../../hooks/useTheme";

export default function FAQItem({
  question,
  answer,
}) {
  const { theme } = useTheme();

  const [open, setOpen] = useState(false);

  return (
    <div
      className={`overflow-hidden rounded-2xl border transition-all duration-300 ${
        theme === "light"
          ? "border-gray-200 bg-white"
          : "border-white/10 bg-white/5 backdrop-blur-xl"
      }`}
    >
      <button
        onClick={() => setOpen(!open)}
        className="flex w-full items-center justify-between p-6 text-left"
      >
        <h3 className="text-lg font-semibold">
          {question}
        </h3>

        <ChevronDown
          className={`transition-transform duration-300 ${
            open ? "rotate-180" : ""
          }`}
        />
      </button>

      {open && (
        <div
          className={`border-t px-6 pb-6 pt-5 ${
            theme === "light"
              ? "border-gray-200 text-gray-600"
              : "border-white/10 text-gray-300"
          }`}
        >
          {answer}
        </div>
      )}
    </div>
  );
}