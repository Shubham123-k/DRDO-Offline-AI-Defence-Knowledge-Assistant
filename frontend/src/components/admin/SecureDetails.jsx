import { useMemo, useState } from "react";
import {
  Eye,
  EyeOff,
  KeyRound,
  LockKeyhole,
  Search,
  ShieldCheck,
  ShieldAlert,
  User,
  Mail,
  RefreshCw,
  X,
} from "lucide-react";
import useTheme from "../../hooks/useTheme";
import {
  verifySecureDetails,
  resetSecureUserPassword,
} from "../../api/adminApi";

export default function SecureDetails() {
  const { theme } = useTheme();
  const isLight = theme === "light";

  const [unlocked, setUnlocked] = useState(false);
  const [adminPassword, setAdminPassword] = useState("");
  const [showAdminPassword, setShowAdminPassword] = useState(false);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("All");

  const [resetUser, setResetUser] = useState(null);
  const [resetAdminPassword, setResetAdminPassword] = useState("");
  const [resetPassword, setResetPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showResetPassword, setShowResetPassword] = useState(false);
  const [resetLoading, setResetLoading] = useState(false);

  const filteredUsers = useMemo(() => {
    const term = search.trim().toLowerCase();
    return users.filter((user) => {
      const matchesFilter =
        filter === "All" || user.clearance === filter;
      const matchesSearch =
        !term ||
        user.username.toLowerCase().includes(term) ||
        user.email.toLowerCase().includes(term);
      return matchesFilter && matchesSearch;
    });
  }, [users, search, filter]);

  const unlock = async (event) => {
    event.preventDefault();
    if (!adminPassword) {
      alert("Enter the administrator password.");
      return;
    }

    try {
      setLoading(true);
      const response = await verifySecureDetails(adminPassword);
      setUsers(response.data.users || []);
      setUnlocked(true);
      setAdminPassword("");
    } catch (error) {
      alert(
        error?.response?.data?.detail ||
          "Unable to verify administrator password."
      );
    } finally {
      setLoading(false);
    }
  };

  const lock = () => {
    setUnlocked(false);
    setUsers([]);
    setSearch("");
    setFilter("All");
  };

  const openReset = (user) => {
    setResetUser(user);
    setResetAdminPassword("");
    setResetPassword("");
    setConfirmPassword("");
    setShowResetPassword(false);
  };

  const closeReset = () => {
    if (resetLoading) return;
    setResetUser(null);
  };

  const submitReset = async (event) => {
    event.preventDefault();

    if (!resetAdminPassword || !resetPassword || !confirmPassword) {
      alert("Please fill all password reset fields.");
      return;
    }

    try {
      setResetLoading(true);
      await resetSecureUserPassword(resetUser.id, {
        admin_password: resetAdminPassword,
        new_password: resetPassword,
        confirm_password: confirmPassword,
      });

      alert(`Password reset successfully for ${resetUser.username}.`);
      closeReset();
    } catch (error) {
      alert(
        error?.response?.data?.detail ||
          "Password reset failed."
      );
    } finally {
      setResetLoading(false);
    }
  };

  const inputClass = `w-full rounded-xl border py-3 px-4 outline-none transition focus:ring-2 focus:ring-blue-500/30 ${
    isLight
      ? "border-gray-300 bg-white text-black placeholder:text-gray-400 focus:border-blue-500"
      : "border-white/10 bg-[#1B1B1B] text-white placeholder:text-gray-500 focus:border-blue-500"
  }`;

  if (!unlocked) {
    return (
      <div className="mx-auto max-w-2xl space-y-8">
        <div>
          <div className="flex items-center gap-4">
            <div
              className={`flex h-14 w-14 items-center justify-center rounded-2xl ${
                isLight
                  ? "bg-red-100 text-red-700"
                  : "bg-red-500/10 text-red-400"
              }`}
            >
              <ShieldAlert size={30} />
            </div>
            <div>
              <h1 className="text-3xl font-bold tracking-tight">
                Secure Details
              </h1>
              <p className={isLight ? "mt-1 text-sm text-gray-500" : "mt-1 text-sm text-gray-400"}>
                Restricted administrator view for Confidential and Secret accounts.
              </p>
            </div>
          </div>
        </div>

        <form
          onSubmit={unlock}
          className={`rounded-2xl border p-8 shadow-sm ${
            isLight
              ? "border-gray-200 bg-white"
              : "border-white/10 bg-[#171717]"
          }`}
        >
          <div className="mb-6 flex items-start gap-4">
            <div className={`rounded-xl p-3 ${isLight ? "bg-blue-100 text-blue-700" : "bg-blue-500/10 text-blue-400"}`}>
              <LockKeyhole size={24} />
            </div>
            <div>
              <h2 className="text-lg font-semibold">Administrator verification required</h2>
              <p className={isLight ? "mt-1 text-sm leading-6 text-gray-600" : "mt-1 text-sm leading-6 text-gray-400"}>
                Enter your administrator password to open the secure account directory. Passwords are never displayed because they are stored as one-way hashes.
              </p>
            </div>
          </div>

          <label className="mb-2 block text-sm font-medium">
            Administrator Password
          </label>
          <div className="relative">
            <KeyRound size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type={showAdminPassword ? "text" : "password"}
              value={adminPassword}
              onChange={(e) => setAdminPassword(e.target.value)}
              placeholder="Enter administrator password"
              disabled={loading}
              className={`${inputClass} pl-10 pr-12`}
              autoComplete="current-password"
            />
            <button
              type="button"
              onClick={() => setShowAdminPassword((v) => !v)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400"
              title={showAdminPassword ? "Hide password" : "Show password"}
            >
              {showAdminPassword ? <EyeOff size={18} /> : <Eye size={18} />}
            </button>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="mt-6 flex w-full items-center justify-center gap-2 rounded-xl bg-blue-600 px-5 py-3.5 font-medium text-white transition hover:bg-blue-700 disabled:opacity-50"
          >
            <ShieldCheck size={19} />
            {loading ? "Verifying..." : "Open Secure Details"}
          </button>
        </form>
      </div>
    );
  }

  return (
    <div className="space-y-7">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div className="flex items-center gap-4">
          <div className={`flex h-14 w-14 items-center justify-center rounded-2xl ${isLight ? "bg-red-100 text-red-700" : "bg-red-500/10 text-red-400"}`}>
            <ShieldAlert size={30} />
          </div>
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Secure Details</h1>
            <p className={isLight ? "mt-1 text-sm text-gray-500" : "mt-1 text-sm text-gray-400"}>
              Confidential and Secret account directory
            </p>
          </div>
        </div>
        <button
          type="button"
          onClick={lock}
          className={`rounded-xl border px-4 py-2.5 text-sm font-medium transition ${isLight ? "border-gray-300 bg-white hover:bg-gray-50" : "border-white/10 bg-[#171717] hover:bg-white/5"}`}
        >
          Lock Secure Details
        </button>
      </div>

      <div className={`rounded-2xl border p-5 ${isLight ? "border-yellow-200 bg-yellow-50" : "border-yellow-500/20 bg-yellow-500/5"}`}>
        <div className="flex items-start gap-3">
          <LockKeyhole size={20} className="mt-0.5 shrink-0 text-yellow-600" />
          <div>
            <p className="font-semibold">Passwords are not viewable</p>
            <p className={isLight ? "mt-1 text-sm leading-6 text-yellow-800/80" : "mt-1 text-sm leading-6 text-gray-400"}>
              Existing passwords are stored as one-way bcrypt hashes. If a secure user forgets a password, use the Reset Password action. The reset operation requires a second administrator password verification.
            </p>
          </div>
        </div>
      </div>

      <div className="flex flex-col gap-3 md:flex-row">
        <div className="relative flex-1">
          <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search username or email..."
            className={`${inputClass} pl-10`}
          />
        </div>
        <select
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
          className={`${inputClass} md:w-52`}
        >
          <option value="All">All Clearances</option>
          <option value="Secret">Secret</option>
          <option value="Confidential">Confidential</option>
        </select>
      </div>

      <div className={`overflow-hidden rounded-2xl border shadow-sm ${isLight ? "border-gray-200 bg-white" : "border-white/10 bg-[#171717]"}`}>
        <div className={`border-b px-6 py-5 ${isLight ? "border-gray-200" : "border-white/10"}`}>
          <div className="flex items-center justify-between">
            <div>
              <h2 className="font-semibold">Secure Accounts</h2>
              <p className="mt-1 text-xs text-gray-500">
                {filteredUsers.length} account{filteredUsers.length === 1 ? "" : "s"} shown
              </p>
            </div>
            <RefreshCw size={18} className="text-gray-400" />
          </div>
        </div>

        {filteredUsers.length === 0 ? (
          <div className="px-6 py-16 text-center text-sm text-gray-500">
            No secure accounts match your search/filter.
          </div>
        ) : (
          <div className="divide-y divide-gray-200 dark:divide-white/10">
            {filteredUsers.map((user) => (
              <div key={user.id} className="flex flex-col gap-5 px-6 py-5 lg:flex-row lg:items-center lg:justify-between">
                <div className="min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <div className="flex items-center gap-2">
                      <User size={17} className="text-gray-400" />
                      <span className="font-semibold">{user.username}</span>
                    </div>
                    <span className={`rounded-full px-3 py-1 text-xs font-medium ${user.clearance === "Secret" ? "bg-red-100 text-red-700 dark:bg-red-500/10 dark:text-red-400" : "bg-yellow-100 text-yellow-700 dark:bg-yellow-500/10 dark:text-yellow-400"}`}>
                      {user.clearance}
                    </span>
                  </div>
                  <div className="mt-2 flex items-center gap-2 text-sm text-gray-500">
                    <Mail size={15} />
                    <span className="truncate">{user.email}</span>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => openReset(user)}
                  className="flex shrink-0 items-center justify-center gap-2 rounded-xl bg-blue-600 px-4 py-2.5 text-sm font-medium text-white transition hover:bg-blue-700"
                >
                  <KeyRound size={17} />
                  Reset Password
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {resetUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm">
          <form
            onSubmit={submitReset}
            className={`w-full max-w-lg rounded-2xl border p-6 shadow-2xl ${isLight ? "border-gray-200 bg-white" : "border-white/10 bg-[#171717]"}`}
          >
            <div className="flex items-start justify-between gap-4">
              <div>
                <h2 className="text-xl font-bold">Reset Secure User Password</h2>
                <p className="mt-1 text-sm text-gray-500">
                  {resetUser.username} · {resetUser.clearance}
                </p>
              </div>
              <button type="button" onClick={closeReset} className="rounded-lg p-2 text-gray-400 hover:bg-gray-100 dark:hover:bg-white/5" title="Close">
                <X size={20} />
              </button>
            </div>

            <div className={`mt-5 rounded-xl border p-4 ${isLight ? "border-blue-200 bg-blue-50" : "border-blue-500/20 bg-blue-500/5"}`}>
              <p className="text-sm leading-6 text-gray-500">
                For security, the old password cannot be displayed. Verify the administrator password again and set a new password for this account.
              </p>
            </div>

            <div className="mt-5 space-y-4">
              <div>
                <label className="mb-2 block text-sm font-medium">Administrator Password</label>
                <input
                  type="password"
                  value={resetAdminPassword}
                  onChange={(e) => setResetAdminPassword(e.target.value)}
                  className={inputClass}
                  placeholder="Enter administrator password again"
                  autoComplete="current-password"
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium">New Password</label>
                <div className="relative">
                  <input
                    type={showResetPassword ? "text" : "password"}
                    value={resetPassword}
                    onChange={(e) => setResetPassword(e.target.value)}
                    className={`${inputClass} pr-12`}
                    placeholder="Enter new password"
                    autoComplete="new-password"
                  />
                  <button type="button" onClick={() => setShowResetPassword((v) => !v)} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400">
                    {showResetPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium">Confirm New Password</label>
                <input
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className={inputClass}
                  placeholder="Confirm new password"
                  autoComplete="new-password"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={resetLoading}
              className="mt-6 flex w-full items-center justify-center gap-2 rounded-xl bg-blue-600 px-5 py-3.5 font-medium text-white transition hover:bg-blue-700 disabled:opacity-50"
            >
              <KeyRound size={18} />
              {resetLoading ? "Resetting Password..." : "Verify & Reset Password"}
            </button>
          </form>
        </div>
      )}
    </div>
  );
}
