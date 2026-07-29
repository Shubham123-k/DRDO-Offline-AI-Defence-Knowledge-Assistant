import { useState } from "react";
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

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
      <div
        className={`w-[420px] rounded-2xl p-6 shadow-xl ${
          theme === "light"
            ? "bg-white"
            : "bg-[#202123]"
        }`}
      >
        <h2 className="mb-6 text-2xl font-bold">
          New Chat
        </h2>

        <p className="mb-4">
          Classification
        </p>

        {[
          "Public",
          "Confidential",
          "Secret",
        ].map((level) => (
          <label
            key={level}
            className={`mb-3 flex cursor-pointer items-center gap-3 rounded-xl border p-4 ${
              theme === "light"
                ? "border-gray-200 hover:bg-gray-50"
                : "border-white/10 hover:bg-[#2A2A2A]"
            }`}
          >
            <input
              type="radio"
              checked={classification === level}
              onChange={() =>
                setClassification(level)
              }
            />

            <span>{level}</span>
          </label>
        ))}

        <div className="mt-6 flex justify-end gap-3">
          <button
            onClick={onClose}
            className="rounded-xl border px-5 py-2"
          >
            Cancel
          </button>

          <button
            onClick={() =>
              onCreate(classification)
            }
            className="rounded-xl bg-blue-600 px-5 py-2 text-white"
          >
            Create
          </button>
        </div>
      </div>
    </div>
  );
}