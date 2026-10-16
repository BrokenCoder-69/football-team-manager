export default function Button({ loading = false, children, ...buttonProps }) {
  return (
    <button
      className="w-full rounded-lg bg-pitch-900 px-4 py-3 font-display text-lg font-bold uppercase tracking-wider text-white transition hover:bg-pitch-800 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-pitch-600 active:scale-[0.99] disabled:cursor-not-allowed disabled:opacity-60"
      disabled={loading}
      {...buttonProps}
    >
      {loading ? "Please wait…" : children}
    </button>
  );
}