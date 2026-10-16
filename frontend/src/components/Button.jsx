import { ArrowRight, LoaderCircle } from "lucide-react";

export default function Button({ loading = false, showArrow = true, children, ...buttonProps }) {
  return (
    <button
      className="group relative flex w-full items-center justify-center gap-2 overflow-hidden rounded-xl bg-pitch-900 px-4 py-3.5 font-display text-lg font-bold uppercase tracking-wider text-white shadow-lg shadow-pitch-900/20 transition hover:bg-pitch-800 hover:shadow-xl hover:shadow-pitch-900/30 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-pitch-600 active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-70"
      disabled={loading}
      {...buttonProps}
    >
      {/* the shine that sweeps across on hover */}
      <span className="pointer-events-none absolute inset-y-0 -left-1/2 w-1/3 -skew-x-12 bg-white/10 transition-transform duration-700 group-hover:translate-x-[450%]" />
      {loading ? (
        <>
          <LoaderCircle className="size-5 animate-spin" />
          Please wait…
        </>
      ) : (
        <>
          {children}
          {showArrow && <ArrowRight className="size-5 transition-transform group-hover:translate-x-1" />}
        </>
      )}
    </button>
  );
}