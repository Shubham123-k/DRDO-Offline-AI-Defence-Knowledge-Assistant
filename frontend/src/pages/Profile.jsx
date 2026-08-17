import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import { getProfile, updateProfile } from "../api/profile";
import useTheme from "../hooks/useTheme";
import PageHeader from "../components/common/PageHeader";
import ParticleBackground from "../components/particles/ParticleBackground";

export default function Profile() {
  const navigate = useNavigate();
  const { theme } = useTheme();
  const [user, setUser] = useState(null);

  const [form, setForm] = useState({
    username: "",
    email: "",
    password: "",
  });

  useEffect(() => {
    loadProfile();
  }, []);

  const loadProfile = async () => {
    try {
      const response = await getProfile();

      setUser(response.data);

      setForm({
        username: response.data.username,
        email: response.data.email,
        password: "",
      });
    } catch (err) {
      console.error(err);
    }
  };

  const saveProfile = async () => {
    try {
      await updateProfile(form);

      alert("Profile updated successfully.");

      loadProfile();
    } catch (err) {
      alert(err.response?.data?.detail || "Unable to update profile.");
    }
  };

  if (!user) {
    return (
      <div
        className={`flex min-h-screen items-center justify-center ${
          theme === "light" ? "bg-gray-50" : "bg-[#0B0B0B]"
        }`}
      >
        <h2 className="text-xl font-semibold animate-pulse">
          Loading Profile...
        </h2>
      </div>
    );
  }

  return (
    <div
      className={`relative min-h-screen overflow-hidden transition-all duration-500 ${
        theme === "light"
          ? "bg-gradient-to-b from-gray-100 via-gray-50 to-white"
          : "bg-gradient-to-br from-[#050505] via-[#0B0B0B] to-[#151515]"
      }`}
    >
      {/* ============================== */}
      {/* Animated Background */}
      {/* ============================== */}

      {theme === "dark" && (
        <>
          <div className="absolute inset-0 opacity-40">
            <ParticleBackground />
          </div>

          <div className="absolute left-0 top-0 h-[500px] w-[500px] rounded-full bg-blue-500/10 blur-[180px]" />

          <div className="absolute bottom-0 right-0 h-[500px] w-[500px] rounded-full bg-cyan-500/10 blur-[180px]" />
        </>
      )}

      <div className="relative z-10 px-8 py-12">
        <div
          className={`mx-auto max-w-5xl rounded-3xl border p-10 backdrop-blur-xl transition-all duration-500 ${
            theme === "light"
              ? "border-gray-200 bg-white shadow-xl"
              : "border-white/10 bg-[#171717]/75"
          }`}
        >
          <PageHeader title="My Profile" backTo="/chat" />

          {/* ======================== */}
          {/* Avatar */}
          {/* ======================== */}

          <div className="mb-12 flex flex-col items-center">
            <div className="flex h-32 w-32 items-center justify-center rounded-full bg-gradient-to-br from-blue-500 via-blue-600 to-cyan-500 text-5xl font-bold text-white shadow-2xl shadow-blue-500/30">
              {form.username.charAt(0).toUpperCase()}
            </div>

            <h2 className="mt-6 text-3xl font-bold">{form.username}</h2>

            <p
              className={`mt-2 rounded-full px-5 py-2 text-sm font-medium ${
                theme === "light"
                  ? "bg-blue-100 text-blue-700"
                  : "bg-blue-500/10 text-blue-300"
              }`}
            >
              {user.role}
            </p>
          </div>

          {/* ======================== */}
          {/* Form */}
          {/* ======================== */}

          <div className="grid gap-7">
            <InputRow
              theme={theme}
              label="Username"
              value={form.username}
              onChange={(e) =>
                setForm({
                  ...form,
                  username: e.target.value,
                })
              }
            />

            <InputRow
              theme={theme}
              label="Email"
              value={form.email}
              onChange={(e) =>
                setForm({
                  ...form,
                  email: e.target.value,
                })
              }
            />

            <InputRow
              theme={theme}
              label="New Password"
              type="password"
              value={form.password}
              onChange={(e) =>
                setForm({
                  ...form,
                  password: e.target.value,
                })
              }
            />

            <ProfileRow theme={theme} label="Role" value={user.role} />

            <ProfileRow
              theme={theme}
              label="Clearance"
              value={user.clearance}
            />

            <ProfileRow theme={theme} label="Status" value={user.status} />
          </div>

          {/* ======================== */}
          {/* Buttons */}
          {/* ======================== */}

          <div className="mt-12 flex flex-wrap justify-end gap-5">
            <button
              onClick={saveProfile}
              className="rounded-2xl bg-gradient-to-r from-blue-600 to-cyan-600 px-8 py-4 font-semibold text-white shadow-lg shadow-blue-500/30 transition-all duration-300 hover:-translate-y-1 hover:shadow-2xl hover:shadow-blue-500/40"
            >
              Save Changes
            </button>

            <button
              onClick={() => {
                localStorage.clear();

                navigate("/signin");
              }}
              className="rounded-2xl bg-gradient-to-r from-red-600 to-red-700 px-8 py-4 font-semibold text-white shadow-lg shadow-red-500/30 transition-all duration-300 hover:-translate-y-1 hover:shadow-2xl hover:shadow-red-500/40"
            >
              Logout
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

function ProfileRow({ label, value, theme }) {
  return (
    <div
      className={`group flex items-center justify-between rounded-2xl border px-6 py-5 transition-all duration-300 hover:-translate-y-1 ${
        theme === "light"
          ? "border-gray-200 bg-white hover:border-blue-500 hover:bg-blue-50 hover:shadow-lg"
          : "border-white/10 bg-white/5 backdrop-blur-xl hover:border-blue-500 hover:bg-white/10"
      }`}
    >
      <div>
        <p
          className={`text-sm ${
            theme === "light" ? "text-gray-500" : "text-gray-400"
          }`}
        >
          {label}
        </p>

        <h3 className="mt-1 text-lg font-semibold">{value}</h3>
      </div>

      <div
        className={`rounded-full px-4 py-2 text-sm font-medium ${
          theme === "light"
            ? "bg-blue-100 text-blue-700"
            : "bg-blue-500/10 text-blue-300"
        }`}
      >
        Active
      </div>
    </div>
  );
}

function InputRow({ label, value, onChange, type = "text", theme }) {
  return (
    <div
      className={`rounded-2xl border p-6 transition-all duration-300 ${
        theme === "light"
          ? "border-gray-200 bg-white shadow-sm"
          : "border-white/10 bg-white/5 backdrop-blur-xl"
      }`}
    >
      <label
        className={`mb-3 block text-sm font-medium ${
          theme === "light" ? "text-gray-600" : "text-gray-400"
        }`}
      >
        {label}
      </label>

      <input
        type={type}
        value={value}
        onChange={onChange}
        placeholder={`Enter ${label.toLowerCase()}`}
        className={`w-full rounded-2xl border px-5 py-4 text-base outline-none transition-all duration-300 ${
          theme === "light"
            ? "border-gray-300 bg-gray-50 focus:border-blue-500 focus:bg-white focus:ring-4 focus:ring-blue-100"
            : "border-white/10 bg-[#111111] focus:border-blue-500 focus:ring-4 focus:ring-blue-500/20"
        }`}
      />
    </div>
  );
}
