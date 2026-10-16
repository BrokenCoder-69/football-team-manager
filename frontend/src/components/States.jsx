import { LoaderCircle, TriangleAlert } from "lucide-react";

export function PageLoader({ label = "Loading…" }) {
  return (
    <div className="flex flex-col items-center justify-center gap-3 py-24 text-slate-400">
      <LoaderCircle className="size-8 animate-spin text-pitch-600" />
      <p className="text-sm">{label}</p>
    </div>
  );
}

export function EmptyState({ icon: Icon, title, message, children }) {
  return (
    <div className="flex animate-fade-up flex-col items-center rounded-3xl border-2 border-dashed border-slate-300 bg-white/60 px-6 py-14 text-center">
      {Icon && (
        <div className="flex size-14 items-center justify-center rounded-2xl bg-pitch-50 text-pitch-700">
          <Icon className="size-7" />
        </div>
      )}
      <h2 className="mt-4 font-display text-3xl font-bold uppercase text-pitch-950">{title}</h2>
      {message && <p className="mt-2 max-w-md text-slate-500">{message}</p>}
      {children && <div className="mt-6 flex flex-wrap justify-center gap-3">{children}</div>}
    </div>
  );
}

export function ErrorState({ title = "Something went wrong", message, children }) {
  return (
    <div className="flex animate-fade-up flex-col items-center rounded-3xl border border-red-200 bg-red-50/50 px-6 py-14 text-center">
      <div className="flex size-14 items-center justify-center rounded-2xl bg-red-100 text-red-600">
        <TriangleAlert className="size-7" />
      </div>
      <h2 className="mt-4 font-display text-3xl font-bold uppercase text-red-900">{title}</h2>
      {message && <p className="mt-2 max-w-md text-red-800/80">{message}</p>}
      {children && <div className="mt-6">{children}</div>}
    </div>
  );
}