import { useState } from "react";
import {
  Shield,
  ShieldCheck,
  LockKeyhole,
  X,
} from "lucide-react";

import useTheme from "../../hooks/useTheme";

export default function ClassificationModal({
  open,
  onClose,
  onCreate,
}) {
  const { theme } = useTheme();

  const [classification, setClassification] =
    useState("Public");

  if (!open) return null;

  const levels = [
    {
      name: "Public",
      description:
        "Information available for general access.",
      icon: Shield,
      light:
        "border-green-200 bg-green-50 text-green-700",
      dark:
        "border-green-500/20 bg-green-500/10 text-green-400",
    },
    {
      name: "Confidential",
      description:
        "Restricted information for authorized users.",
      icon: ShieldCheck,
      light:
        "border-yellow-200 bg-yellow-50 text-yellow-700",
      dark:
        "border-yellow-500/20 bg-yellow-500/10 text-yellow-400",
    },
    {
      name: "Secret",
      description:
        "Highly restricted classified information.",
      icon: LockKeyhole,
      light:
        "border-red-200 bg-red-50 text-red-700",
      dark:
        "border-red-500/20 bg-red-500/10 text-red-400",
    },
  ];

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4 backdrop-blur-sm"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) {
          onClose();
        }
      }}
    >
      <div
        className={`relative w-full max-w-md overflow-hidden rounded-3xl border shadow-2xl transition-all duration-300 ${
          theme === "light"
            ? "border-gray-200 bg-white"
            : "border-white/10 bg-[#171717]"
        }`}
      >
        {/* Top accent */}
        <div className="h-1 w-full bg-blue-600" />

        {/* Close button */}
        <button
          type="button"
          onClick={onClose}
          className={`absolute right-5 top-5 rounded-full p-2 transition ${
            theme === "light"
              ? "text-gray-400 hover:bg-gray-100 hover:text-gray-700"
              : "text-gray-500 hover:bg-white/10 hover:text-white"
          }`}
          aria-label="Close"
        >
          <X size={19} />
        </button>

        <div className="p-7">
          {/* Header */}
          <div className="mb-7 flex items-start gap-4">
            <div
              className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl ${
                theme === "light"
                  ? "bg-blue-50 text-blue-600"
                  : "bg-blue-500/10 text-blue-400"
              }`}
            >
              <ShieldCheck size={25} />
            </div>

            <div className="pr-8">
              <h2 className="text-2xl font-bold tracking-tight">
                New Chat
              </h2>

              <p
                className={`mt-1 text-sm leading-5 ${
                  theme === "light"
                    ? "text-gray-500"
                    : "text-gray-400"
                }`}
              >
                Select the security classification
                for this conversation.
              </p>
            </div>
          </div>

          {/* Classification label */}
          <div className="mb-3">
            <p className="text-sm font-semibold">
              Security Classification
            </p>

            <p
              className={`mt-1 text-xs ${
                theme === "light"
                  ? "text-gray-400"
                  : "text-gray-500"
              }`}
            >
              Choose the appropriate access level.
            </p>
          </div>

          {/* Classification options */}
          <div className="space-y-3">
            {levels.map((level) => {
              const Icon = level.icon;
              const selected =
                classification === level.name;

              return (
                <label
                  key={level.name}
                  className={`group relative flex cursor-pointer items-center gap-4 rounded-2xl border p-4 transition-all duration-200 ${
                    selected
                      ? theme === "light"
                        ? level.light
                        : level.dark
                      : theme === "light"
                      ? "border-gray-200 bg-white hover:border-gray-300 hover:bg-gray-50"
                      : "border-white/10 bg-[#1D1D1D] hover:border-white/20 hover:bg-[#222]"
                  }`}
                >
                  {/* Radio */}
                  <input
                    type="radio"
                    name="classification"
                    value={level.name}
                    checked={selected}
                    onChange={() =>
                      setClassification(level.name)
                    }
                    className="sr-only"
                  />

                  {/* Icon */}
                  <div
                    className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl transition ${
                      selected
                        ? theme === "light"
                          ? "bg-white/70"
                          : "bg-black/20"
                        : theme === "light"
                        ? "bg-gray-100 text-gray-500 group-hover:bg-gray-200"
                        : "bg-white/5 text-gray-400 group-hover:bg-white/10"
                    }`}
                  >
                    <Icon size={21} />
                  </div>

                  {/* Text */}
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <span className="font-semibold">
                        {level.name}
                      </span>

                      {selected && (
                        <span className="rounded-full bg-blue-600 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-white">
                          Selected
                        </span>
                      )}
                    </div>

                    <p
                      className={`mt-1 text-xs leading-5 ${
                        theme === "light"
                          ? "text-gray-500"
                          : "text-gray-400"
                      }`}
                    >
                      {level.description}
                    </p>
                  </div>

                  {/* Custom radio indicator */}
                  <div
                    className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-full border-2 transition ${
                      selected
                        ? "border-blue-600"
                        : theme === "light"
                        ? "border-gray-300"
                        : "border-gray-600"
                    }`}
                  >
                    {selected && (
                      <div className="h-2.5 w-2.5 rounded-full bg-blue-600" />
                    )}
                  </div>
                </label>
              );
            })}
          </div>

          {/* Security notice */}
          <div
            className={`mt-5 rounded-xl border px-4 py-3 text-xs leading-5 ${
              theme === "light"
                ? "border-blue-100 bg-blue-50 text-blue-700"
                : "border-blue-500/10 bg-blue-500/5 text-blue-300"
            }`}
          >
            <div className="flex gap-2">
              <Shield
                size={15}
                className="mt-0.5 shrink-0"
              />

              <p>
                The selected classification determines
                the security level associated with this
                chat.
              </p>
            </div>
          </div>

          {/* Actions */}
          <div className="mt-7 flex gap-3">
            <button
              type="button"
              onClick={onClose}
              className={`flex-1 rounded-xl border px-5 py-3 text-sm font-medium transition ${
                theme === "light"
                  ? "border-gray-200 bg-white text-gray-700 hover:bg-gray-50"
                  : "border-white/10 bg-transparent text-gray-300 hover:bg-white/5 hover:text-white"
              }`}
            >
              Cancel
            </button>

            <button
              type="button"
              onClick={() =>
                onCreate(classification)
              }
              className="flex-1 rounded-xl bg-blue-600 px-5 py-3 text-sm font-semibold text-white shadow-lg shadow-blue-600/20 transition hover:bg-blue-700 active:scale-[0.98]"
            >
              Create Chat
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}