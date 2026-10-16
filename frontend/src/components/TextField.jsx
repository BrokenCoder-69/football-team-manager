export default function TextField({ label, error, ...inputProps }) {
  return (
    <label className="block">
      <span className="mb-1 block text-sm font-medium text-slate-700">{label}</span>
      <input
        className={`w-full rounded-lg border bg-white px-3 py-2 outline-none focus:ring-2 focus:ring-emerald-500 ${
          error ? "border-red-500" : "border-slate-300"
        }`}
        {...inputProps}
      />
      {error && <span className="mt-1 block text-sm text-red-600">{error}</span>}
    </label>
  );
}