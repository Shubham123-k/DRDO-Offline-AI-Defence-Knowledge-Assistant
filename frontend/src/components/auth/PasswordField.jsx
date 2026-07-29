import { Eye, EyeOff } from "lucide-react";
import { useState } from "react";

export default function PasswordField({
  label,
  placeholder,
  value,
  onChange,
}) {
  const [show, setShow] = useState(false);

  return (
    <div className="space-y-2">
      <label className="text-sm font-medium">
        {label}
      </label>

      <div className="flex items-center rounded-xl border border-gray-700 bg-white/5 px-4">
        <input
          type={show ? "text" : "password"}
          placeholder={placeholder}
          value={value}
          onChange={onChange}
          className="w-full bg-transparent py-3 outline-none"
        />

        <button
          type="button"
          onClick={() => setShow(!show)}
        >
          {show ? (
            <EyeOff size={18} />
          ) : (
            <Eye size={18} />
          )}
        </button>
      </div>
    </div>
  );
}