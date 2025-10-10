export function Input({
  label,
  name,
  type = "text",
  value,
  onChange,
  placeholder = "",
  required = false,
  autoComplete = "off",
}) {
  return (
    <div className="flex flex-col gap-1">
      {label && (
        <label htmlFor={name} className="text-sm font-medium text-slate-200">
          {label}
        </label>
      )}
      <input
        id={name}
        name={name}
        type={type}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        required={required}
        autoComplete={autoComplete}
        className="w-full rounded-lg bg-slate-800/60 border border-slate-700 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/30 px-3 py-2 text-slate-100 placeholder:text-slate-400 outline-none"
      />
    </div>
  );
}
