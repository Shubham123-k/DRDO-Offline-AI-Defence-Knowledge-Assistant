import ThemeToggle from "../common/ThemeToggle";

export default function AdminHeader() {
  return (
    <header className="flex items-center justify-between border-b border-gray-200 px-8 py-5 dark:border-white/10">
      <div>
        <h1 className="text-2xl font-bold">
          DRDO Admin Panel
        </h1>

        <p className="text-sm text-gray-500 dark:text-gray-400">
          Offline Defence Knowledge Assistant
        </p>
      </div>

      <ThemeToggle />
    </header>
  );
}