function PitchLines() {
  return (
    <svg
      viewBox="0 0 400 600"
      preserveAspectRatio="xMidYMid slice"
      className="absolute inset-0 h-full w-full"
      aria-hidden="true"
    >
      <g fill="none" stroke="currentColor" strokeWidth="2">
        <rect x="20" y="20" width="360" height="560" />
        <line x1="20" y1="300" x2="380" y2="300" />
        <circle cx="200" cy="300" r="55" />
        <rect x="100" y="20" width="200" height="90" />
        <rect x="150" y="20" width="100" height="35" />
        <rect x="100" y="490" width="200" height="90" />
        <rect x="150" y="545" width="100" height="35" />
      </g>
      <circle cx="200" cy="300" r="4" fill="currentColor" />
    </svg>
  );
}

function Brand({ className = "" }) {
  return (
    <div className={`flex items-center gap-2 font-display text-xl font-bold uppercase tracking-wide ${className}`}>
      <span className="text-2xl">⚽</span> Football Team Manager
    </div>
  );
}

export default function AuthLayout({ title, subtitle, children, footer }) {
  return (
    <div className="flex min-h-screen">
      {/* Left: the pitch panel (hidden on phones) */}
      <aside className="relative hidden w-1/2 flex-col justify-between overflow-hidden bg-pitch-900 p-12 text-white lg:flex">
        <div className="pointer-events-none absolute inset-0 text-white/10">
          <PitchLines />
        </div>

        <Brand className="relative" />

        <div className="relative">
          <h2 className="font-display text-6xl font-extrabold uppercase leading-[0.9]">
            Run your team
            <br />
            like <span className="text-lime">matchday.</span>
          </h2>
          <ul className="mt-8 space-y-3 text-lg text-pitch-100">
            <li>🔒 Players secure their seat with an advance</li>
            <li>💸 Match fees split and tracked automatically</li>
            <li>📋 Squads, results and stats in one place</li>
          </ul>
        </div>

        <p className="relative text-sm text-pitch-200">
          Built for local football, from five-a-side to league day.
        </p>
      </aside>

      {/* Right: the form */}
      <main className="flex w-full items-center justify-center px-4 py-12 lg:w-1/2">
        <div className="w-full max-w-sm">
          <Brand className="mb-10 text-pitch-900 lg:hidden" />
          <h1 className="font-display text-4xl font-bold uppercase tracking-wide text-pitch-950">
            {title}
          </h1>
          {subtitle && <p className="mt-1 text-slate-500">{subtitle}</p>}
          <div className="mt-8">{children}</div>
          {footer && <p className="mt-6 text-sm text-slate-600">{footer}</p>}
        </div>
      </main>
    </div>
  );
}