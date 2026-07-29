export default function InputField({
  label,
  type = "text",
  placeholder,
  value,
  onChange,
  icon,
}) {
  return (
    <div className="flex flex-col gap-2">
      <label className="text-sm font-medium">
        {label}
      </label>
      <div className="flex items-center rounded-xl border border-gray-700 bg-white/5 px-4 py-3 transition-all duration-300 focus-within:border-blue-500">
        {icon && (
          <span className="mr-3 text-gray-400">
            {icon}
          </span>
        )}

        <input
          type={type}
          placeholder={placeholder}
          value={value}
          onChange={onChange}
          className="w-full bg-transparent outline-none"
        />
      </div>
    </div>
  );
}