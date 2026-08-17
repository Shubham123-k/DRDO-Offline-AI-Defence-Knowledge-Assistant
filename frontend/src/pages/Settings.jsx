import { ArrowLeft, Sun, Moon, Monitor, Trash2, RotateCcw, Shield, KeyRound, LogOut, ChevronRight } from "lucide-react";
import { useNavigate } from "react-router-dom";
import useTheme from "../hooks/useTheme";
import ThemeToggle from "../components/common/ThemeToggle";
import ParticleBackground from "../components/particles/ParticleBackground";
import { deleteAccount } from "../api/profile";

export default function Settings() {
  const navigate = useNavigate();

  const { theme, toggleTheme } = useTheme();

  return (
    <div
      className={`relative min-h-screen overflow-hidden transition-all duration-500 ${
        theme === "light"
          ? "bg-gradient-to-b from-gray-100 via-gray-50 to-white text-black"
          : "bg-gradient-to-br from-[#050505] via-[#0B0B0B] to-[#151515] text-white"
      }`}
    >

      {/* Particle Background */}
      {theme === "dark" && (
        <>
          <div className="absolute inset-0 opacity-40">
            <ParticleBackground />
          </div>
          <div className="absolute left-0 top-0 h-96 w-96 rounded-full bg-blue-500/10 blur-[160px]" />
          <div className="absolute bottom-0 right-0 h-96 w-96 rounded-full bg-cyan-500/10 blur-[180px]" />
        </>
      )}

      <div className="relative z-10 mx-auto max-w-6xl px-8 py-12">

        {/* Header */}
        <div className="mb-14 flex items-center justify-between">
          <div className="flex items-center gap-5">
            <button
              onClick={() => navigate("/chat")}
              className={`rounded-2xl border p-3 transition-all duration-300 hover:scale-105 ${
                theme === "light"
                  ? "border-gray-300 bg-white shadow hover:bg-gray-100"
                  : "border-white/10 bg-white/5 backdrop-blur-xl hover:bg-white/10"
              }`}
            >
              <ArrowLeft size={22} />
            </button>

            <div>
              <h1 className="text-5xl font-bold">
                Settings
              </h1>
              <p
                className={`mt-3 text-lg ${
                  theme === "light"
                    ? "text-gray-600"
                    : "text-gray-400"
                }`}
              >
                Personalize your DRDO AI Assistant experience.
              </p>
            </div>
          </div>
          <ThemeToggle />
        </div>

        {/* Appearance */}
        <Section
          title="Appearance"
          icon="🎨"
          theme={theme}
        >

          <SettingRow
            icon={<Sun size={22} />}
            title="Light Mode"
            subtitle="Bright interface for daytime work."
            active={theme === "light"}
            onClick={() =>
              theme === "dark" && toggleTheme()
            }
            theme={theme}
          />

          <SettingRow
            icon={<Moon size={22} />}
            title="Dark Mode"
            subtitle="Comfortable viewing in low light."
            active={theme === "dark"}
            onClick={() =>
              theme === "light" && toggleTheme()
            }
            theme={theme}
          />

          <SettingRow
            icon={<Monitor size={22} />}
            title="System Theme"
            subtitle="Automatically follow your operating system."
            badge="Coming Soon"
            theme={theme}
          />

        </Section>

        {/* Chat */}

        <Section
          title="Chat"
          icon="💬"
          theme={theme}
        >

          <ActionRow
            icon={<Trash2 size={22} />}
            title="Clear Chat History"
            subtitle="Delete all previous conversations."
            theme={theme}
          />

          <ActionRow
            icon={<RotateCcw size={22} />}
            title="Reset Preferences"
            subtitle="Restore chat settings to default."
            theme={theme}
          />

        </Section>

        {/* Security */}

        <Section
          title="Security"
          icon="🔒"
          theme={theme}
        >

          <ActionRow
            icon={<KeyRound size={22} />}
            title="Change Password"
            subtitle="Update your login password."
            theme={theme}
          />

          <ActionRow
            icon={<Shield size={22} />}
            title="Privacy"
            subtitle="Manage account privacy."
            badge="Soon"
            theme={theme}
          />

        </Section>

        {/* Danger Zone */}
        <div
          className={`mt-10 rounded-3xl border p-8 backdrop-blur-xl transition-all duration-500 ${
            theme === "light"
              ? "border-red-200 bg-white shadow-xl"
              : "border-red-500/20 bg-[#171717]/75"
          }`}
        >

          <h2 className="mb-3 text-3xl font-bold text-red-500">
            Danger Zone
          </h2>

          <p
            className={`mb-8 ${
              theme === "light"
                ? "text-gray-500"
                : "text-gray-400"
            }`}
          >
            These actions are permanent and cannot be undone.
          </p>
          <div className="space-y-5">

            {/* Logout */}
            <button
              onClick={() => {
                localStorage.clear();
                navigate("/signin");
              }}
              className="flex w-full items-center justify-between rounded-2xl bg-red-600 px-6 py-5 text-white transition-all duration-300 hover:scale-[1.02] hover:bg-red-700"
            >
              <div className="flex items-center gap-4">
                <LogOut size={22} />
                <div className="text-left">
                  <h3 className="font-semibold">
                    Logout
                  </h3>
                  <p className="text-sm text-red-100">
                    Sign out from your account.
                  </p>
                </div>
              </div>
              <ChevronRight />
            </button>

            {/* Delete */}
            <button
              onClick={async () => {
                const confirmed = window.confirm(
                  "This action will permanently delete your account.\n\nContinue?"
                );
                if (!confirmed) return;
                try {
                  await deleteAccount();
                  localStorage.clear();
                  alert("Account deleted successfully.");
                  navigate("/signin");

                } catch (err) {
                  alert(
                    err.response?.data?.detail ||
                      "Unable to delete account."
                  );
                }
              }}
              className={`flex w-full items-center justify-between rounded-2xl border px-6 py-5 transition-all duration-300 hover:scale-[1.02] ${
                theme === "light"
                  ? "border-red-300 bg-red-50 text-red-700 hover:bg-red-100"
                  : "border-red-500/20 bg-red-500/10 text-red-400 hover:bg-red-500/20"
              }`}
            >
              <div className="flex items-center gap-4">
                <Trash2 size={22} />
                <div className="text-left">
                  <h3 className="font-semibold">
                    Delete Account
                  </h3>
                  <p className="text-sm opacity-80">
                    Permanently remove your account and all associated data.
                  </p>
                </div>
              </div>
              <ChevronRight />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

function Section({ title, icon, children, theme }) {
  return (
    <div
      className={`mb-10 overflow-hidden rounded-3xl border backdrop-blur-xl transition-all duration-500 ${
        theme === "light"
          ? "border-gray-200 bg-white/95 shadow-xl"
          : "border-white/10 bg-[#171717]/75 shadow-2xl"
      }`}
    >
      <div
        className={`border-b px-8 py-6 ${
          theme === "light"
            ? "border-gray-200 bg-gradient-to-r from-gray-50 to-white"
            : "border-white/10 bg-white/5"
        }`}
      >
        <h2 className="text-3xl font-bold tracking-tight">
          {icon} {title}
        </h2>
      </div>

      <div className="space-y-4 p-8">
        {children}
      </div>
    </div>
  );
}

function SettingRow({
  icon,
  title,
  subtitle,
  active,
  badge,
  onClick,
  theme,
}) {
  return (
    <button
      onClick={onClick}
      className={`group flex w-full items-center justify-between rounded-2xl border px-6 py-5 text-left transition-all duration-300 hover:-translate-y-1 ${
        theme === "light"
          ? "border-gray-200 bg-white hover:border-blue-500 hover:bg-blue-50 hover:shadow-lg"
          : "border-white/10 bg-white/5 hover:border-blue-500 hover:bg-white/10 hover:shadow-blue-500/10"
      }`}
    >
      <div className="flex items-center gap-5">

        <div
          className={`flex h-14 w-14 items-center justify-center rounded-2xl transition-all ${
            theme === "light"
              ? "bg-blue-100 text-blue-600 group-hover:bg-blue-600 group-hover:text-white"
              : "bg-blue-500/10 text-blue-400 group-hover:bg-blue-600 group-hover:text-white"
          }`}
        >
          {icon}
        </div>

        <div>

          <h3 className="text-xl font-semibold">
            {title}
          </h3>

          <p
            className={`mt-1 ${
              theme === "light"
                ? "text-gray-500"
                : "text-gray-400"
            }`}
          >
            {subtitle}
          </p>

        </div>

      </div>

      {badge ? (
        <span
          className={`rounded-full px-4 py-2 text-sm font-medium ${
            theme === "light"
              ? "bg-gray-100 text-gray-700"
              : "bg-white/10 text-gray-300"
          }`}
        >
          {badge}
        </span>
      ) : active ? (
        <span className="rounded-full bg-blue-600 px-5 py-2 text-sm font-medium text-white shadow-lg shadow-blue-500/40">
          Active
        </span>
      ) : (
        <ChevronRight
          className="transition-transform duration-300 group-hover:translate-x-1"
        />
      )}
    </button>
  );
}

function ActionRow({
  icon,
  title,
  subtitle,
  badge,
  theme,
}) {
  return (
    <button
      className={`group flex w-full items-center justify-between rounded-2xl border px-6 py-5 text-left transition-all duration-300 hover:-translate-y-1 ${
        theme === "light"
          ? "border-gray-200 bg-white hover:border-blue-500 hover:bg-blue-50 hover:shadow-lg"
          : "border-white/10 bg-white/5 hover:border-blue-500 hover:bg-white/10 hover:shadow-blue-500/10"
      }`}
    >
      <div className="flex items-center gap-5">

        <div
          className={`flex h-14 w-14 items-center justify-center rounded-2xl transition-all ${
            theme === "light"
              ? "bg-blue-100 text-blue-600 group-hover:bg-blue-600 group-hover:text-white"
              : "bg-blue-500/10 text-blue-400 group-hover:bg-blue-600 group-hover:text-white"
          }`}
        >
          {icon}
        </div>

        <div>
          <h3 className="text-xl font-semibold">
            {title}
          </h3>
          <p
            className={`mt-1 ${
              theme === "light"
                ? "text-gray-500"
                : "text-gray-400"
            }`}
          >
            {subtitle}
          </p>
        </div>
      </div>

      {badge ? (
        <span
          className={`rounded-full px-4 py-2 text-sm font-medium ${
            theme === "light"
              ? "bg-gray-100 text-gray-700"
              : "bg-white/10 text-gray-300"
          }`}
        >
          {badge}
        </span>
      ) : (
        <ChevronRight
          className="transition-transform duration-300 group-hover:translate-x-1"
        />
      )}
    </button>
  );
}