import { Link } from "react-router-dom";
import Logo from "../common/Logo";
import ThemeToggle from "../common/ThemeToggle";

export default function Navbar() {
  return (
    <header className="fixed top-0 left-0 z-50 w-full border-b border-white/10 bg-black/40 backdrop-blur-md">
      <nav className="mx-auto flex h-16 max-w-7xl items-center justify-between px-6">
        {/* Logo */}
        <Link to="/" className="flex items-center gap-3">
          <Logo />

          <span className="text-xl font-bold tracking-wide text-white">
            DRDO AI Assistant
          </span>
        </Link>

        {/* Navigation */}
        <div className="flex items-center gap-5">
          <Link
            to="/"
            className="text-sm text-gray-300 transition hover:text-white"
          >
            Home
          </Link>

          <Link
            to="/signin"
            className="rounded-lg border border-blue-500 px-4 py-2 text-sm text-white transition hover:bg-blue-600"
          >
            Sign In
          </Link>

          <Link
            to="/signup"
            className="rounded-lg bg-blue-600 px-4 py-2 text-sm text-white transition hover:bg-blue-700"
          >
            Sign Up
          </Link>
          <ThemeToggle />
        </div>
      </nav>
    </header>
  );
}
