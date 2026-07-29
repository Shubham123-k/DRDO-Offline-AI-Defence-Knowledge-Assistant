import { ArrowLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";
import ThemeToggle from "./ThemeToggle";

export default function PageHeader({
  title,
  subtitle,
  backTo = "/chat",
}) {
  const navigate = useNavigate();

  return (
    <div className="mb-10 flex items-center justify-between">
      <div className="flex items-center gap-4">
        <button
          onClick={() => navigate(backTo)}
          className="rounded-xl border p-3 transition hover:bg-gray-100 dark:border-white/10 dark:hover:bg-white/10"
        >
          <ArrowLeft size={20} />
        </button>

        <div>
          <h1 className="text-3xl font-bold">
            {title}
          </h1>

          {subtitle && (
            <p className="mt-1 text-gray-500 dark:text-gray-400">
              {subtitle}
            </p>
          )}
        </div>
      </div>

      <ThemeToggle />
    </div>
  );
}