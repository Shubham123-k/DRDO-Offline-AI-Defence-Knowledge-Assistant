import { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  User,
  Settings,
  LogOut,
  HelpCircle,
  Pencil,
  ChevronUp,
} from "lucide-react";
import useTheme from "../../hooks/useTheme";

export default function ProfileMenu() {
  const [open, setOpen] = useState(false);
  const menuRef = useRef(null);
  const { theme } = useTheme();
  const navigate = useNavigate();

  const user = JSON.parse(localStorage.getItem("user"));

  useEffect(() => {
    function handleClickOutside(e) {
      if (menuRef.current && !menuRef.current.contains(e.target)) {
        setOpen(false);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);

    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div
      ref={menuRef}
      className="relative border-t border-gray-200 dark:border-white/10"
    >
      {/* Popup */}

      {open && (
        <div
          className={`absolute bottom-20 left-4 right-4 rounded-2xl border shadow-xl transition-colors duration-300 ${
            theme === "light"
              ? "border-gray-200 bg-white"
              : "border-white/10 bg-[#202123]"
          }`}
        >
          <button
            onClick={() => {
              setOpen(false);
              navigate("/profile");
            }}
            className={`flex w-full items-center gap-3 px-4 py-3 transition-colors ${
              theme === "light" ? "hover:bg-gray-100" : "hover:bg-white/10"
            }`}
          >
            <User size={18} />
            My Profile
          </button>

          <button
            onClick={() => {
              setOpen(false);
              // We'll open the username modal later
            }}
            className={`flex w-full items-center gap-3 px-4 py-3 transition-colors ${
              theme === "light" ? "hover:bg-gray-100" : "hover:bg-white/10"
            }`}
          >
            <Pencil size={18} />
            Edit Username
          </button>

          <button
            onClick={() => {
              setOpen(false);
              navigate("/settings");
            }}
            className={`flex w-full items-center gap-3 px-4 py-3 transition-colors ${
              theme === "light" ? "hover:bg-gray-100" : "hover:bg-white/10"
            }`}
          >
            <Settings size={18} />
            Settings
          </button>

          <button
            onClick={() => {
              setOpen(false);
              navigate("/help");
            }}
            className={`flex w-full items-center gap-3 px-4 py-3 transition-colors ${
              theme === "light" ? "hover:bg-gray-100" : "hover:bg-white/10"
            }`}
          >
            <HelpCircle size={18} />
            Help
          </button>

          <button
            onClick={() => {
              localStorage.clear();
              navigate("/signin", { replace: true });
            }}
            className={`flex w-full items-center gap-3 px-4 py-3 text-red-500 transition-colors ${
              theme === "light" ? "hover:bg-red-50" : "hover:bg-red-500/10"
            }`}
          >
            <LogOut size={18} />
            Logout
          </button>
        </div>
      )}

      {/* Bottom User Card */}

      <button
        onClick={() => setOpen(!open)}
        className="flex w-full items-center justify-between p-4 transition hover:bg-gray-100 dark:hover:bg-white/5"
      >
        <div className="flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-full bg-blue-600 text-white">
            <User size={20} />
          </div>

          <div className="text-left">
            <p className="font-semibold">{user?.username}</p>

            <p className="text-sm text-gray-500">{user?.clearance}</p>
          </div>
        </div>

        <ChevronUp
          size={18}
          className={`transition ${open ? "rotate-180" : ""}`}
        />
      </button>
    </div>
  );
}
