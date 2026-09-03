import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import { User, Mail, Shield, KeyRound, CheckCircle2, Pencil, ArrowLeft, Lock, BadgeCheck } from "lucide-react";

import { getProfile } from "../api/profile";
import useTheme from "../hooks/useTheme";
import ParticleBackground from "../components/particles/ParticleBackground";

export default function Profile() {
  const navigate = useNavigate();
  const { theme } = useTheme();

  const isLight = theme === "light";
  const [user, setUser] = useState(null);

  useEffect(() => {
    loadProfile();
  }, []);

  const loadProfile = async () => {
    try {
      const response = await getProfile();

      setUser(response.data);

      localStorage.setItem(
        "user",
        JSON.stringify(response.data)
      );
    } catch (error) {
      console.error(error);
    }
  };

  if (!user) {
    return (
      <div
        className={`flex min-h-screen items-center justify-center ${
          isLight
            ? "bg-gray-50"
            : "bg-[#080808]"
        }`}
      >
        <div className="text-center">
          <div className="mx-auto h-10 w-10 animate-spin rounded-full border-4 border-blue-500/20 border-t-blue-500" />

          <p className="mt-4 text-sm text-gray-500">
            Loading secure profile...
          </p>
        </div>
      </div>
    );
  }

  const initial =
    user.username
      ?.charAt(0)
      ?.toUpperCase() || "U";

  return (
    <div
      className={`relative min-h-screen overflow-hidden ${
        isLight
          ? "bg-gradient-to-br from-gray-50 via-white to-blue-50"
          : "bg-gradient-to-br from-[#030303] via-[#0A0A0A] to-[#111827]"
      }`}
    >

      {/* =====================================================
          BACKGROUND
      ===================================================== */}

      {!isLight && (
        <>
          <div className="absolute inset-0 opacity-30">
            <ParticleBackground />
          </div>

          <div className="absolute -left-40 -top-40 h-[500px] w-[500px] rounded-full bg-blue-500/10 blur-[150px]" />

          <div className="absolute -bottom-40 -right-40 h-[500px] w-[500px] rounded-full bg-cyan-500/10 blur-[150px]" />
        </>
      )}

      <div className="relative z-10 px-5 py-8 sm:px-8 lg:px-12">

        <div className="mx-auto max-w-6xl">

          {/* =================================================
              HEADER
          ================================================= */}

          <div className="mb-8 flex items-center justify-between">

            <button
              onClick={() =>
                navigate("/chat")
              }
              className={`flex items-center gap-2 rounded-xl px-4 py-2 text-sm transition ${
                isLight
                  ? "hover:bg-gray-200"
                  : "hover:bg-white/5"
              }`}
            >
              <ArrowLeft size={18} />
              Back to Assistant
            </button>

            <button
              onClick={() =>
                navigate("/edit-user")
              }
              className="flex items-center gap-2 rounded-xl bg-blue-600 px-5 py-2.5 text-sm font-semibold text-white shadow-lg shadow-blue-500/20 transition hover:-translate-y-0.5 hover:bg-blue-700"
            >
              <Pencil size={17} />
              Edit User
            </button>
          </div>

          <div
            className={`overflow-hidden rounded-[2rem] border shadow-2xl backdrop-blur-xl ${
              isLight
                ? "border-gray-200 bg-white"
                : "border-white/10 bg-[#121212]/90"
            }`}
          >

            <div className="relative">
              <div className="absolute inset-x-0 top-0 h-48 bg-gradient-to-r from-blue-600/20 via-cyan-500/10 to-transparent" />
              <div className="relative px-7 pb-8 pt-10 sm:px-10">
                <div className="flex flex-col items-center gap-6 sm:flex-row">
                  <div className="relative">

                    <div className="flex h-32 w-32 items-center justify-center rounded-[2rem] bg-gradient-to-br from-blue-600 via-blue-500 to-cyan-500 text-5xl font-bold text-white shadow-2xl shadow-blue-500/30">
                      {initial}
                    </div>

                    <div className="absolute -bottom-2 -right-2 flex h-10 w-10 items-center justify-center rounded-full border-4 border-white bg-green-500 text-white shadow-lg">
                      <CheckCircle2
                        size={20}
                      />
                    </div>
                  </div>
                  <div className="flex-1 text-center sm:text-left">
                    <div className="flex flex-wrap items-center justify-center gap-3 sm:justify-start">

                      <h1 className="text-3xl font-bold sm:text-4xl">
                        {user.username}
                      </h1>

                      <span className="flex items-center gap-1 rounded-full bg-green-500/10 px-3 py-1 text-xs font-semibold text-green-500">
                        <BadgeCheck
                          size={14}
                        />
                        Verified
                      </span>
                    </div>

                    <p className="mt-2 text-gray-500">
                      {user.email}
                    </p>

                    <div className="mt-4 flex flex-wrap justify-center gap-2 sm:justify-start">
                      <span
                        className={`rounded-full px-4 py-1.5 text-xs font-medium ${
                          isLight
                            ? "bg-blue-100 text-blue-700"
                            : "bg-blue-500/10 text-blue-300"
                        }`}
                      >
                        {user.role}
                      </span>
                      <span
                        className={`rounded-full px-4 py-1.5 text-xs font-medium ${
                          isLight
                            ? "bg-purple-100 text-purple-700"
                            : "bg-purple-500/10 text-purple-300"
                        }`}
                      >
                        {user.clearance}
                      </span>
                      <span
                        className={`rounded-full px-4 py-1.5 text-xs font-medium ${
                          isLight
                            ? "bg-green-100 text-green-700"
                            : "bg-green-500/10 text-green-300"
                        }`}
                      >
                        {user.status}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div
              className={`border-t p-7 sm:p-10 ${
                isLight
                  ? "border-gray-100"
                  : "border-white/10"
              }`}
            >

              <div className="mb-6">
                <h2 className="text-xl font-bold">
                  Account Information
                </h2>

                <p className="mt-1 text-sm text-gray-500">
                  Your current account details.
                </p>
              </div>

              <div className="grid gap-5 md:grid-cols-2">

                <InfoCard
                  icon={<User size={20} />}
                  title="Username"
                  value={user.username}
                  isLight={isLight}
                />

                <InfoCard
                  icon={<Mail size={20} />}
                  title="Email Address"
                  value={user.email}
                  isLight={isLight}
                />

                <InfoCard
                  icon={<Shield size={20} />}
                  title="Role"
                  value={user.role}
                  isLight={isLight}
                />

                <InfoCard
                  icon={<KeyRound size={20} />}
                  title="Security Clearance"
                  value={user.clearance}
                  isLight={isLight}
                />

              </div>

              <div className="mt-8">
                <div className="mb-5">
                  <h2 className="text-xl font-bold">
                    Account Security
                  </h2>

                  <p className="mt-1 text-sm text-gray-500">
                    Your account is protected by
                    security-question verification.
                  </p>
                </div>

                <div
                  className={`rounded-2xl border p-5 ${
                    isLight
                      ? "border-green-200 bg-green-50"
                      : "border-green-500/20 bg-green-500/5"
                  }`}
                >

                  <div className="flex gap-4">

                    <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-green-500/10">
                      <Lock
                        size={21}
                        className="text-green-500"
                      />
                    </div>

                    <div>

                      <h3 className="font-semibold text-green-600">
                        Security Verification Enabled
                      </h3>

                      <p
                        className={`mt-1 text-sm ${
                          isLight
                            ? "text-gray-600"
                            : "text-gray-400"
                        }`}
                      >
                        Changes to your username,
                        email or password require
                        successful security-question
                        verification.
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="mt-8 flex justify-end">

                <button
                  onClick={() =>
                    navigate("/edit-user")
                  }
                  className="flex items-center gap-2 rounded-2xl bg-gradient-to-r from-blue-600 to-cyan-600 px-7 py-4 font-semibold text-white shadow-lg shadow-blue-500/20 transition hover:-translate-y-0.5 hover:shadow-xl"
                >
                  <Pencil size={18} />
                  Edit User Information
                </button>
              </div>
            </div>
          </div>

          <div className="mt-6 text-center text-xs text-gray-500">
            DRDO Offline Defence Knowledge Assistant
            • Secure Account Environment
          </div>
        </div>
      </div>
    </div>
  );
}


function InfoCard({
  icon,
  title,
  value,
  isLight,
}) {
  return (
    <div
      className={`group rounded-2xl border p-5 transition-all duration-300 hover:-translate-y-1 ${
        isLight
          ? "border-gray-200 bg-gray-50 hover:border-blue-300 hover:bg-blue-50"
          : "border-white/10 bg-white/[0.03] hover:border-blue-500/30 hover:bg-blue-500/[0.03]"
      }`}
    >

      <div className="flex items-center gap-4">

        <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-blue-500/10 text-blue-500 transition group-hover:scale-105">
          {icon}
        </div>
        <div className="min-w-0">

          <p className="text-xs font-medium uppercase tracking-wide text-gray-500">
            {title}
          </p>

          <p className="mt-1 truncate text-base font-semibold">
            {value}
          </p>
        </div>
      </div>
    </div>
  );
}