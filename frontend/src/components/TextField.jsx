export default function TextField({ label, error, ...inputProps }) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-sm font-semibold text-slate-700">{label}</span>
      <input
        className={`w-full rounded-lg border bg-white px-3.5 py-2.5 outline-none transition placeholder:text-slate-400 focus:border-pitch-600 focus:ring-4 focus:ring-pitch-100 ${
          error ? "border-red-500" : "border-slate-300"
        }`}
        {...inputProps}
      />
      {error && <span className="mt-1.5 block text-sm text-red-600">{error}</span>}
    </label>
  );
}