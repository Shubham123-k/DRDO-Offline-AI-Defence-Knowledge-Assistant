import { useState } from "react";
import { ShieldCheck, LockKeyhole, UserPlus, Mail, User, KeyRound, CheckCircle2, Eye, EyeOff, ShieldAlert } from "lucide-react";

import useTheme from "../../hooks/useTheme";
import { createSecureUser } from "../../api/adminApi";

export default function SecureUsers() {
  const { theme } = useTheme();

  const [formData, setFormData] = useState({
    username: "",
    email: "",
    password: "",
    clearance: "Confidential",
  });

  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const handleChange =
    (field) => (event) => {
      setFormData((prev) => ({
        ...prev,
        [field]: event.target.value,
      }));
    };

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (
      !formData.username.trim() ||
      !formData.email.trim() ||
      !formData.password
    ) {
      alert("Please fill all fields.");
      return;
    }

    try {
      setLoading(true);

      await createSecureUser({
        username: formData.username.trim(),
        email: formData.email.trim().toLowerCase(),
        password: formData.password,
        clearance: formData.clearance,
      });

      alert(
        `${formData.clearance} user created successfully.`
      );

      setFormData({
        username: "",
        email: "",
        password: "",
        clearance: "Confidential",
      });

      setShowPassword(false);
    } catch (error) {
      alert(
        error?.response?.data?.detail ||
          "Failed to create secure user."
      );
    } finally {
      setLoading(false);
    }
  };

  const isLight = theme === "light";

  return (
    <div className="space-y-8">

      {/* Header */}
      <div>
        <div className="flex items-center gap-4">

          <div
            className={`flex h-14 w-14 items-center justify-center rounded-2xl ${
              isLight
                ? "bg-blue-100 text-blue-700"
                : "bg-blue-500/10 text-blue-400"
            }`}
          >
            <ShieldCheck size={30} />
          </div>

          <div>
            <h1 className="text-3xl font-bold tracking-tight">
              Secure Users
            </h1>

            <p
              className={`mt-1 text-sm ${
                isLight
                  ? "text-gray-500"
                  : "text-gray-400"
              }`}
            >
              Create and manage administrator-controlled
              secure accounts.
            </p>
          </div>

        </div>
      </div>


      {/* Security Notice */}
      <div
        className={`flex items-start gap-4 rounded-2xl border p-5 ${
          isLight
            ? "border-blue-200 bg-blue-50"
            : "border-blue-500/20 bg-blue-500/5"
        }`}
      >
        <div
          className={`mt-0.5 rounded-lg p-2 ${
            isLight
              ? "bg-blue-100 text-blue-700"
              : "bg-blue-500/10 text-blue-400"
          }`}
        >
          <LockKeyhole size={20} />
        </div>

        <div>
          <h3 className="font-semibold">
            Restricted Account Creation
          </h3>

          <p
            className={`mt-1 text-sm leading-6 ${
              isLight
                ? "text-blue-700/80"
                : "text-gray-400"
            }`}
          >
            Secure accounts are created directly by an
            administrator and are automatically approved.
            Select the appropriate clearance level based
            on the user's authorized access.
          </p>
        </div>
      </div>


      {/* Main Layout */}
      <div className="grid gap-8 xl:grid-cols-[minmax(0,1fr)_320px]">

        {/* Form */}
        <form
          onSubmit={handleSubmit}
          className={`rounded-2xl border shadow-sm ${
            isLight
              ? "border-gray-200 bg-white"
              : "border-white/10 bg-[#171717]"
          }`}
        >

          {/* Form Header */}
          <div
            className={`border-b px-6 py-5 ${
              isLight
                ? "border-gray-200"
                : "border-white/10"
            }`}
          >
            <div className="flex items-center gap-3">

              <div
                className={`rounded-xl p-2.5 ${
                  isLight
                    ? "bg-gray-100 text-gray-700"
                    : "bg-white/5 text-gray-300"
                }`}
              >
                <UserPlus size={21} />
              </div>

              <div>
                <h2 className="font-semibold">
                  Create Secure Account
                </h2>

                <p
                  className={`text-xs ${
                    isLight
                      ? "text-gray-500"
                      : "text-gray-500"
                  }`}
                >
                  Enter the authorized user's credentials
                </p>
              </div>

            </div>
          </div>


          {/* Form Body */}
          <div className="space-y-6 p-6">

            {/* Username */}
            <div>
              <label className="mb-2 block text-sm font-medium">
                Username
              </label>

              <div className="relative">

                <User
                  size={18}
                  className={`absolute left-3 top-1/2 -translate-y-1/2 ${
                    isLight
                      ? "text-gray-400"
                      : "text-gray-500"
                  }`}
                />

                <input
                  type="text"
                  value={formData.username}
                  onChange={handleChange("username")}
                  placeholder="Enter username"
                  disabled={loading}
                  className={`w-full rounded-xl border py-3 pl-10 pr-4 outline-none transition focus:ring-2 focus:ring-blue-500/30 ${
                    isLight
                      ? "border-gray-300 bg-white text-black placeholder:text-gray-400 focus:border-blue-500"
                      : "border-white/10 bg-[#1B1B1B] text-white placeholder:text-gray-500 focus:border-blue-500"
                  }`}
                />

              </div>
            </div>


            {/* Email */}
            <div>
              <label className="mb-2 block text-sm font-medium">
                Email Address
              </label>

              <div className="relative">

                <Mail
                  size={18}
                  className={`absolute left-3 top-1/2 -translate-y-1/2 ${
                    isLight
                      ? "text-gray-400"
                      : "text-gray-500"
                  }`}
                />

                <input
                  type="email"
                  value={formData.email}
                  onChange={handleChange("email")}
                  placeholder="Enter email address"
                  disabled={loading}
                  className={`w-full rounded-xl border py-3 pl-10 pr-4 outline-none transition focus:ring-2 focus:ring-blue-500/30 ${
                    isLight
                      ? "border-gray-300 bg-white text-black placeholder:text-gray-400 focus:border-blue-500"
                      : "border-white/10 bg-[#1B1B1B] text-white placeholder:text-gray-500 focus:border-blue-500"
                  }`}
                />

              </div>
            </div>


            {/* Password */}
            <div>
              <label className="mb-2 block text-sm font-medium">
                Password
              </label>

              <div className="relative">

                <KeyRound
                  size={18}
                  className={`absolute left-3 top-1/2 -translate-y-1/2 ${
                    isLight
                      ? "text-gray-400"
                      : "text-gray-500"
                  }`}
                />

                <input
                  type={
                    showPassword
                      ? "text"
                      : "password"
                  }
                  value={formData.password}
                  onChange={handleChange("password")}
                  placeholder="Create secure password"
                  disabled={loading}
                  className={`w-full rounded-xl border py-3 pl-10 pr-12 outline-none transition focus:ring-2 focus:ring-blue-500/30 ${
                    isLight
                      ? "border-gray-300 bg-white text-black placeholder:text-gray-400 focus:border-blue-500"
                      : "border-white/10 bg-[#1B1B1B] text-white placeholder:text-gray-500 focus:border-blue-500"
                  }`}
                />

                <button
                  type="button"
                  onClick={() =>
                    setShowPassword(
                      (prev) => !prev
                    )
                  }
                  className={`absolute right-3 top-1/2 -translate-y-1/2 ${
                    isLight
                      ? "text-gray-400 hover:text-gray-700"
                      : "text-gray-500 hover:text-gray-200"
                  }`}
                  title={
                    showPassword
                      ? "Hide password"
                      : "Show password"
                  }
                >
                  {showPassword ? (
                    <EyeOff size={18} />
                  ) : (
                    <Eye size={18} />
                  )}
                </button>

              </div>
            </div>


            {/* Clearance */}
            <div>
              <label className="mb-3 block text-sm font-medium">
                Security Clearance
              </label>

              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">

                {/* Confidential */}
                <button
                  type="button"
                  disabled={loading}
                  onClick={() =>
                    setFormData((prev) => ({
                      ...prev,
                      clearance: "Confidential",
                    }))
                  }
                  className={`rounded-xl border p-4 text-left transition ${
                    formData.clearance ===
                    "Confidential"
                      ? isLight
                        ? "border-yellow-400 bg-yellow-50"
                        : "border-yellow-500/40 bg-yellow-500/10"
                      : isLight
                        ? "border-gray-200 bg-gray-50 hover:border-gray-300"
                        : "border-white/10 bg-[#1B1B1B] hover:border-white/20"
                  }`}
                >
                  <div className="flex items-center justify-between">

                    <div
                      className={`rounded-lg p-2 ${
                        isLight
                          ? "bg-yellow-100 text-yellow-700"
                          : "bg-yellow-500/10 text-yellow-400"
                      }`}
                    >
                      <ShieldCheck size={19} />
                    </div>

                    {formData.clearance ===
                      "Confidential" && (
                      <CheckCircle2
                        size={19}
                        className="text-blue-500"
                      />
                    )}

                  </div>

                  <h3 className="mt-3 font-semibold">
                    Confidential
                  </h3>

                  <p
                    className={`mt-1 text-xs ${
                      isLight
                        ? "text-gray-500"
                        : "text-gray-500"
                    }`}
                  >
                    Controlled information
                  </p>
                </button>


                {/* Secret */}
                <button
                  type="button"
                  disabled={loading}
                  onClick={() =>
                    setFormData((prev) => ({
                      ...prev,
                      clearance: "Secret",
                    }))
                  }
                  className={`rounded-xl border p-4 text-left transition ${
                    formData.clearance === "Secret"
                      ? isLight
                        ? "border-red-400 bg-red-50"
                        : "border-red-500/40 bg-red-500/10"
                      : isLight
                        ? "border-gray-200 bg-gray-50 hover:border-gray-300"
                        : "border-white/10 bg-[#1B1B1B] hover:border-white/20"
                  }`}
                >
                  <div className="flex items-center justify-between">

                    <div
                      className={`rounded-lg p-2 ${
                        isLight
                          ? "bg-red-100 text-red-700"
                          : "bg-red-500/10 text-red-400"
                      }`}
                    >
                      <ShieldAlert size={19} />
                    </div>

                    {formData.clearance ===
                      "Secret" && (
                      <CheckCircle2
                        size={19}
                        className="text-blue-500"
                      />
                    )}

                  </div>

                  <h3 className="mt-3 font-semibold">
                    Secret
                  </h3>

                  <p
                    className={`mt-1 text-xs ${
                      isLight
                        ? "text-gray-500"
                        : "text-gray-500"
                    }`}
                  >
                    Highly restricted information
                  </p>
                </button>

              </div>
            </div>


            {/* Submit */}
            <button
              type="submit"
              disabled={loading}
              className="flex w-full items-center justify-center gap-2 rounded-xl bg-blue-600 px-5 py-3.5 font-medium text-white shadow-sm transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
            >
              <ShieldCheck size={19} />

              {loading
                ? "Creating Secure Account..."
                : "Create Secure User"}
            </button>

          </div>
        </form>


        {/* Security Information */}
        <div className="space-y-5">

          <div
            className={`rounded-2xl border p-6 ${
              isLight
                ? "border-gray-200 bg-white"
                : "border-white/10 bg-[#171717]"
            }`}
          >

            <div className="mb-5 flex items-center gap-3">

              <div
                className={`rounded-lg p-2 ${
                  isLight
                    ? "bg-green-100 text-green-700"
                    : "bg-green-500/10 text-green-400"
                }`}
              >
                <ShieldCheck size={20} />
              </div>

              <h3 className="font-semibold">
                Account Security
              </h3>

            </div>

            <div className="space-y-4">

              <div className="flex gap-3">
                <CheckCircle2
                  size={17}
                  className="mt-0.5 shrink-0 text-green-500"
                />

                <p
                  className={`text-sm ${
                    isLight
                      ? "text-gray-600"
                      : "text-gray-400"
                  }`}
                >
                  Account is automatically approved.
                </p>
              </div>

              <div className="flex gap-3">
                <CheckCircle2
                  size={17}
                  className="mt-0.5 shrink-0 text-green-500"
                />

                <p
                  className={`text-sm ${
                    isLight
                      ? "text-gray-600"
                      : "text-gray-400"
                  }`}
                >
                  Clearance determines document access.
                </p>
              </div>

              <div className="flex gap-3">
                <CheckCircle2
                  size={17}
                  className="mt-0.5 shrink-0 text-green-500"
                />

                <p
                  className={`text-sm ${
                    isLight
                      ? "text-gray-600"
                      : "text-gray-400"
                  }`}
                >
                  Credentials are stored securely.
                </p>
              </div>

              <div className="flex gap-3">
                <CheckCircle2
                  size={17}
                  className="mt-0.5 shrink-0 text-green-500"
                />

                <p
                  className={`text-sm ${
                    isLight
                      ? "text-gray-600"
                      : "text-gray-400"
                  }`}
                >
                  AI retrieval respects clearance levels.
                </p>
              </div>

            </div>
          </div>


          {/* Selected Clearance */}
          <div
            className={`rounded-2xl border p-6 ${
              isLight
                ? "border-gray-200 bg-gray-50"
                : "border-white/10 bg-[#171717]"
            }`}
          >

            <p
              className={`text-xs font-medium uppercase tracking-wider ${
                isLight
                  ? "text-gray-500"
                  : "text-gray-500"
              }`}
            >
              Selected Clearance
            </p>

            <div className="mt-3 flex items-center gap-3">

              <div
                className={`rounded-lg p-2 ${
                  formData.clearance ===
                  "Secret"
                    ? isLight
                      ? "bg-red-100 text-red-700"
                      : "bg-red-500/10 text-red-400"
                    : isLight
                      ? "bg-yellow-100 text-yellow-700"
                      : "bg-yellow-500/10 text-yellow-400"
                }`}
              >
                <ShieldCheck size={20} />
              </div>

              <div>
                <p className="font-semibold">
                  {formData.clearance}
                </p>

                <p
                  className={`text-xs ${
                    isLight
                      ? "text-gray-500"
                      : "text-gray-500"
                  }`}
                >
                  Access level assigned to this account
                </p>
              </div>
            </div>

          </div>
        </div>

      </div>
    </div>
  );
}