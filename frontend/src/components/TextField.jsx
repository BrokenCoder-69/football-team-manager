export default function TextField({ label, error, hint, icon: Icon, trailing, ...inputProps }) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-sm font-semibold text-slate-700">{label}</span>
      <span className="group relative block">
        {Icon && (
          <Icon
            aria-hidden="true"
            className="pointer-events-none absolute left-3.5 top-1/2 size-[18px] -translate-y-1/2 text-slate-400 transition-colors group-focus-within:text-pitch-600"
          />
        )}
        <input
          aria-invalid={error ? true : undefined}
          className={`w-full rounded-xl border bg-white py-3 text-[15px] shadow-sm shadow-slate-900/5 outline-none transition placeholder:text-slate-400 hover:border-slate-400 focus:border-pitch-600 focus:ring-4 focus:ring-pitch-600/15 ${
            Icon ? "pl-11" : "pl-3.5"
          } ${trailing ? "pr-12" : "pr-3.5"} ${
            error ? "border-red-400 focus:border-red-500 focus:ring-red-500/15" : "border-slate-300"
          }`}
          {...inputProps}
        />
        {trailing && <span className="absolute inset-y-0 right-1.5 flex items-center">{trailing}</span>}
      </span>
      {error ? (
        <span className="mt-1.5 block text-sm text-red-600">{error}</span>
      ) : (
        hint && <span className="mt-1.5 block text-xs text-slate-500">{hint}</span>
      )}
    </label>
  );
}