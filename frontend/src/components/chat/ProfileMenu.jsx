import { useState, useRef, useEffect } from "react";
import { User, Settings, LogOut, HelpCircle, Pencil, ChevronUp } from "lucide-react";

import { useNavigate } from "react-router-dom";
import useTheme from "../../hooks/useTheme";

export default function ProfileMenu({ collapsed = false }) {
  const [open, setOpen] = useState(false);
  const menuRef = useRef(null);
  const { theme } = useTheme();

  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem("user") || "null");
  const isLight = theme === "light";

  useEffect(() => {
    function handleClickOutside(event) {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setOpen(false);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);

    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  if (collapsed) {
    return (
      <div
        ref={menuRef}
        className={`relative flex shrink-0 items-center justify-center border-t p-3 ${
          isLight ? "border-gray-200" : "border-white/[0.08]"
        }`}
      >
        {/* Popup */}
        {open && (
          <div
            className={`absolute bottom-3 left-[68px] z-[100] w-60 overflow-hidden rounded-2xl border shadow-2xl ${
              isLight
                ? "border-gray-200 bg-white"
                : "border-white/[0.10] bg-[#202123]"
            }`}
          >
            <button
              onClick={() => {
                setOpen(false);
                navigate("/profile");
              }}
              className={`flex w-full items-center gap-3 px-4 py-3 text-sm transition ${
                isLight ? "hover:bg-gray-100" : "hover:bg-white/[0.06]"
              }`}
            >
              <User size={17} />
              My Profile
            </button>

            <button
              onClick={() => {
                setOpen(false);
                navigate("/edit-user");
              }}
              className={`flex w-full items-center gap-3 px-4 py-3 text-sm transition ${
                isLight ? "hover:bg-gray-100" : "hover:bg-white/[0.06]"
              }`}
            >
              <Pencil size={17} />
              Edit User
            </button>

            <button
              onClick={() => {
                setOpen(false);
                navigate("/settings");
              }}
              className={`flex w-full items-center gap-3 px-4 py-3 text-sm transition ${
                isLight ? "hover:bg-gray-100" : "hover:bg-white/[0.06]"
              }`}
            >
              <Settings size={17} />
              Settings
            </button>

            <button
              onClick={() => {
                setOpen(false);
                navigate("/help");
              }}
              className={`flex w-full items-center gap-3 px-4 py-3 text-sm transition ${
                isLight ? "hover:bg-gray-100" : "hover:bg-white/[0.06]"
              }`}
            >
              <HelpCircle size={17} />
              Help
            </button>

            <div
              className={`my-1 h-px ${
                isLight ? "bg-gray-200" : "bg-white/[0.08]"
              }`}
            />

            <button
              onClick={() => {
                localStorage.clear();

                navigate("/signin", { replace: true });
              }}
              className="flex w-full items-center gap-3 px-4 py-3 text-sm text-red-500 transition hover:bg-red-500/10"
            >
              <LogOut size={17} />
              Logout
            </button>
          </div>
        )}

        {/* Avatar */}
        <button
          type="button"
          onClick={() => setOpen((prev) => !prev)}
          aria-label="Open profile menu"
          title={user?.username || "Profile"}
          className={`group relative flex h-10 w-10 items-center justify-center rounded-full text-sm font-semibold transition-all duration-200 ${
            isLight
              ? "bg-gray-200 text-gray-700 hover:bg-gray-300"
              : "bg-[#2a2b2c] text-gray-200 hover:bg-[#343536]"
          }`}
        >
          {user?.username?.charAt(0)?.toUpperCase() || "U"}

          {/* Online indicator */}
          <span
            className={`absolute bottom-0 right-0 h-3 w-3 rounded-full border-2 ${
              isLight
                ? "border-[#f8f9fa] bg-green-500"
                : "border-[#101112] bg-green-400"
            }`}
          />
        </button>
      </div>
    );
  }

  return (
    <div
      ref={menuRef}
      className={`relative shrink-0 border-t ${
        isLight ? "border-gray-200" : "border-white/[0.08]"
      }`}
    >
      {/* PROFILE POPUP */}
      {open && (
        <div
          className={`absolute bottom-[76px] left-3 right-3 z-[100] overflow-hidden rounded-2xl border shadow-2xl ${
            isLight
              ? "border-gray-200 bg-white"
              : "border-white/[0.10] bg-[#202123]"
          }`}
        >
          {/* User header */}
          <div
            className={`border-b px-4 py-4 ${
              isLight ? "border-gray-100" : "border-white/[0.06]"
            }`}
          >
            <div className="flex items-center gap-3">
              <div
                className={`flex h-10 w-10 items-center justify-center rounded-full text-sm font-semibold ${
                  isLight
                    ? "bg-gray-200 text-gray-700"
                    : "bg-[#303132] text-gray-200"
                }`}
              >
                {user?.username?.charAt(0)?.toUpperCase() || "U"}
              </div>

              <div className="min-w-0">
                <p className="truncate text-sm font-semibold">
                  {user?.username || "User"}
                </p>

                <p
                  className={`truncate text-xs ${
                    isLight ? "text-gray-500" : "text-gray-500"
                  }`}
                >
                  {user?.clearance || "Public"}
                </p>
              </div>
            </div>
          </div>

          {/* Profile */}
          <button
            onClick={() => {
              setOpen(false);
              navigate("/profile");
            }}
            className={`flex w-full items-center gap-3 px-4 py-3 text-sm transition ${
              isLight ? "hover:bg-gray-100" : "hover:bg-white/[0.06]"
            }`}
          >
            <User size={17} />
            My Profile
          </button>

          {/* Edit */}
          <button
            onClick={() => {
              setOpen(false);
              navigate("/edit-user");
            }}
            className={`flex w-full items-center gap-3 px-4 py-3 text-sm transition ${
              isLight ? "hover:bg-gray-100" : "hover:bg-white/[0.06]"
            }`}
          >
            <Pencil size={17} />
            Edit User
          </button>

          {/* Settings */}
          <button
            onClick={() => {
              setOpen(false);
              navigate("/settings");
            }}
            className={`flex w-full items-center gap-3 px-4 py-3 text-sm transition ${
              isLight ? "hover:bg-gray-100" : "hover:bg-white/[0.06]"
            }`}
          >
            <Settings size={17} />
            Settings
          </button>

          {/* Help */}
          <button
            onClick={() => {
              setOpen(false);
              navigate("/help");
            }}
            className={`flex w-full items-center gap-3 px-4 py-3 text-sm transition ${
              isLight ? "hover:bg-gray-100" : "hover:bg-white/[0.06]"
            }`}
          >
            <HelpCircle size={17} />
            Help
          </button>

          <div
            className={`my-1 h-px ${
              isLight ? "bg-gray-100" : "bg-white/[0.06]"
            }`}
          />

          {/* Logout */}
          <button
            onClick={() => {
              localStorage.clear();

              navigate("/signin", { replace: true });
            }}
            className="flex w-full items-center gap-3 px-4 py-3 text-sm text-red-500 transition hover:bg-red-500/10"
          >
            <LogOut size={17} />
            Logout
          </button>
        </div>
      )}

      <button
        type="button"
        onClick={() => setOpen((prev) => !prev)}
        className={`group flex w-full items-center justify-between p-3 transition-all duration-200 ${
          isLight ? "hover:bg-gray-100" : "hover:bg-white/[0.04]"
        }`}
      >
        <div className="flex min-w-0 items-center gap-3">
          {/* Avatar */}

          <div
            className={`relative flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-sm font-semibold ${
              isLight
                ? "bg-gray-200 text-gray-700"
                : "bg-[#2a2b2c] text-gray-200"
            }`}
          >
            {user?.username?.charAt(0)?.toUpperCase() || "U"}

            <span
              className={`absolute bottom-0 right-0 h-3 w-3 rounded-full border-2 ${
                isLight
                  ? "border-[#f8f9fa] bg-green-500"
                  : "border-[#101112] bg-green-400"
              }`}
            />
          </div>

          {/* User details */}
          <div className="min-w-0 text-left">
            <p className="truncate text-sm font-semibold">
              {user?.username || "User"}
            </p>

            <p
              className={`truncate text-[11px] ${
                isLight ? "text-gray-500" : "text-gray-500"
              }`}
            >
              {user?.clearance || "Public"}
            </p>
          </div>
        </div>

        <ChevronUp
          size={17}
          className={`shrink-0 transition-transform duration-200 ${
            open ? "rotate-180" : ""
          } ${isLight ? "text-gray-500" : "text-gray-500"}`}
        />
      </button>
    </div>
  );
}
