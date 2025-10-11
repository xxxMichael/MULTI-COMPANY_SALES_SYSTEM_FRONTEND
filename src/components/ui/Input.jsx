export function Input({
  label,
  name,
  type = "text",
  value,
  onChange,
  onBlur,
  placeholder = "",
  required = false,
  autoComplete = "off",
  maxLength,
  error,
  showPasswordToggle = false,
  onToggleShowPassword,
}) {
  return (
    <div className="flex flex-col gap-1">
      {label && (
        <label htmlFor={name} className="text-sm font-medium text-slate-200">
          {label}
        </label>
      )}
      <div className="relative">
        <input
          id={name}
          name={name}
          type={type}
          value={value}
          onChange={onChange}
          onBlur={onBlur}
          placeholder={placeholder}
          required={required}
          autoComplete={autoComplete}
          maxLength={maxLength}
          className={`w-full rounded-lg bg-slate-800/60 border px-3 py-2 pr-10 text-slate-100 placeholder:text-slate-400 outline-none ${
            error ? "border-red-500 focus:border-red-500 focus:ring-red-500/30" : "border-slate-700 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/30"
          }`}
        />
        {showPasswordToggle && (
          <button
            type="button"
            onClick={onToggleShowPassword}
            className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-slate-200"
          >
            {type === "password" ? (
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
              </svg>
            ) : (
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.878 9.878L3 3m6.878 6.878L21 21" />
              </svg>
            )}
          </button>
        )}
      </div>
      {error && <span className="text-sm text-red-400">{error}</span>}
    </div>
  );
}
