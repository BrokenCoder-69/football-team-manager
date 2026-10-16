export default function AuthLayout({ title, subtitle, children, footer }) {
  return (
    <div className="flex min-h-screen items-center justify-center px-4">
      <div className="w-full max-w-sm">
        <div className="mb-6 text-center">
          <div className="text-4xl">⚽</div>
          <h1 className="mt-2 text-2xl font-bold">{title}</h1>
          {subtitle && <p className="mt-1 text-slate-500">{subtitle}</p>}
        </div>
        <div className="rounded-2xl bg-white p-6 shadow-sm">{children}</div>
        {footer && <p className="mt-4 text-center text-sm text-slate-600">{footer}</p>}
      </div>
    </div>
  );
}