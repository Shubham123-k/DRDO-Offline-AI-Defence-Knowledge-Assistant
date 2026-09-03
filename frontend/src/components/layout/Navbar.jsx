import { Link, useLocation } from "react-router-dom";
import {
  Home,
  LogIn,
  UserPlus,
  ShieldCheck,
  ChevronRight,
} from "lucide-react";

import Logo from "../common/Logo";
import ThemeToggle from "../common/ThemeToggle";
import useTheme from "../../hooks/useTheme";

export default function Navbar() {
  const { theme } = useTheme();
  const location = useLocation();

  const isLight = theme === "light";

  const isActive = (path) => location.pathname === path;

  return (
    <header
      className={`fixed left-0 top-0 z-50 w-full border-b backdrop-blur-xl transition-all duration-300 ${
        isLight
          ? "border-gray-200/80 bg-white/80"
          : "border-white/[0.08] bg-black/70"
      }`}
    >
      <nav className="mx-auto flex h-[72px] max-w-7xl items-center justify-between px-5 sm:px-6 lg:px-8">

        {/* =====================================================
            LOGO / BRAND
        ====================================================== */}
        <Link
          to="/"
          className="group flex min-w-0 items-center gap-3"
        >
          {/* Logo container */}
          <div
            className={`relative flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border transition-all duration-300 ${
              isLight
                ? "border-gray-200 bg-white shadow-sm group-hover:border-blue-200 group-hover:shadow-md"
                : "border-white/[0.08] bg-white/[0.04] group-hover:border-white/[0.15] group-hover:bg-white/[0.07]"
            }`}
          >
            <Logo className="h-8 w-auto" />

            {/* Small status indicator */}
            <span
              className={`absolute -bottom-0.5 -right-0.5 h-2.5 w-2.5 rounded-full border-2 ${
                isLight
                  ? "border-white bg-green-500"
                  : "border-black bg-green-400"
              }`}
            />
          </div>

          {/* Brand text */}
          <div className="hidden min-w-0 sm:block">
            <div className="flex items-center gap-2">
              <span
                className={`truncate text-[15px] font-bold tracking-wide ${
                  isLight
                    ? "text-gray-900"
                    : "text-white"
                }`}
              >
                DRDO AI Assistant
              </span>

              <span
                className={`rounded-full border px-1.5 py-0.5 text-[8px] font-semibold uppercase tracking-wider ${
                  isLight
                    ? "border-blue-200 bg-blue-50 text-blue-600"
                    : "border-blue-500/20 bg-blue-500/10 text-blue-400"
                }`}
              >
                AI
              </span>
            </div>

            <div
              className={`mt-0.5 flex items-center gap-1.5 text-[9px] font-medium uppercase tracking-wider ${
                isLight
                  ? "text-gray-400"
                  : "text-gray-500"
              }`}
            >
              <ShieldCheck size={10} />
              Offline Defence Environment
            </div>
          </div>
        </Link>

        {/* =====================================================
            NAVIGATION
        ====================================================== */}
        <div className="flex items-center gap-1.5 sm:gap-2">

          {/* Home */}
          <Link
            to="/"
            className={`group relative flex items-center gap-2 rounded-xl px-3 py-2 text-sm font-medium transition-all duration-200 sm:px-3.5 ${
              isActive("/")
                ? isLight
                  ? "bg-gray-100 text-gray-900"
                  : "bg-white/[0.08] text-white"
                : isLight
                ? "text-gray-500 hover:bg-gray-100 hover:text-gray-900"
                : "text-gray-400 hover:bg-white/[0.06] hover:text-white"
            }`}
          >
            <Home
              size={16}
              strokeWidth={1.9}
              className="transition-transform duration-200 group-hover:scale-105"
            />

            <span className="hidden sm:inline">
              Home
            </span>

            {isActive("/") && (
              <span
                className={`absolute bottom-0 left-1/2 h-0.5 w-5 -translate-x-1/2 rounded-full ${
                  isLight
                    ? "bg-blue-600"
                    : "bg-blue-500"
                }`}
              />
            )}
          </Link>

          {/* Divider */}
          <div
            className={`mx-1 hidden h-6 w-px sm:block ${
              isLight
                ? "bg-gray-200"
                : "bg-white/[0.08]"
            }`}
          />

          {/* Sign In */}
          <Link
            to="/signin"
            className={`group flex items-center gap-2 rounded-xl border px-3 py-2 text-sm font-medium transition-all duration-200 sm:px-4 ${
              isLight
                ? "border-gray-200 bg-white text-gray-700 shadow-sm hover:border-blue-300 hover:bg-blue-50 hover:text-blue-700"
                : "border-white/[0.1] bg-white/[0.03] text-gray-300 hover:border-blue-500/40 hover:bg-blue-500/10 hover:text-blue-400"
            }`}
          >
            <LogIn
              size={16}
              strokeWidth={1.9}
              className="transition-transform duration-200 group-hover:translate-x-0.5"
            />

            <span className="hidden sm:inline">
              Sign In
            </span>
          </Link>

          {/* Sign Up */}
          <Link
            to="/signup"
            className={`group relative flex items-center gap-2 overflow-hidden rounded-xl px-3 py-2 text-sm font-semibold text-white shadow-lg transition-all duration-200 sm:px-4 ${
              isLight
                ? "bg-blue-600 shadow-blue-600/20 hover:bg-blue-700 hover:shadow-blue-600/30"
                : "bg-blue-600 shadow-blue-600/20 hover:bg-blue-500 hover:shadow-blue-500/30"
            }`}
          >
            {/* Shine effect */}
            <span className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/15 to-transparent transition-transform duration-700 group-hover:translate-x-full" />

            <UserPlus
              size={16}
              strokeWidth={2}
              className="relative transition-transform duration-200 group-hover:scale-105"
            />

            <span className="relative hidden sm:inline">
              Sign Up
            </span>

            <ChevronRight
              size={14}
              className="relative hidden transition-transform duration-200 group-hover:translate-x-0.5 sm:block"
            />
          </Link>

          {/* Theme Toggle */}
          <div
            className={`ml-1 border-l pl-2 sm:ml-2 sm:pl-3 ${
              isLight
                ? "border-gray-200"
                : "border-white/[0.08]"
            }`}
          >
            <ThemeToggle />
          </div>
        </div>
      </nav>
    </header>
  );
}