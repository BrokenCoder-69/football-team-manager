export default function Button({ loading = false, children, ...buttonProps }) {
  return (
    <button
      className="w-full rounded-lg bg-emerald-600 px-4 py-2 font-semibold text-white transition hover:bg-emerald-700 disabled:cursor-not-allowed disabled:opacity-60"
      disabled={loading}
      {...buttonProps}
    >
      {loading ? "Please wait…" : children}
    </button>
  );
}