import { ShieldCheck, Users, Wallet } from "lucide-react";

const FEATURES = [
  { icon: ShieldCheck, text: "Seats secured by advance" },
  { icon: Wallet, text: "Fees split automatically" },
  { icon: Users, text: "Squads, results & stats" },
];

const SQUAD = [
  { initials: "RA", color: "bg-amber-300 text-amber-950" },
  { initials: "TH", color: "bg-sky-300 text-sky-950" },
  { initials: "FZ", color: "bg-rose-300 text-rose-950" },
  { initials: "SY", color: "bg-violet-300 text-violet-950" },
  { initials: "NB", color: "bg-lime text-pitch-950" },
];

function PitchLines() {
  return (
    <svg
      viewBox="0 0 400 600"
      preserveAspectRatio="xMidYMid slice"
      className="absolute inset-0 h-full w-full"
      aria-hidden="true"
    >
      {/* pathLength="1" lets one dash animation draw every shape fully */}
      <g fill="none" stroke="currentColor" strokeWidth="1.5" strokeDasharray="1" className="animate-draw">
        <rect pathLength="1" x="20" y="20" width="360" height="560" rx="2" />
        <line pathLength="1" x1="20" y1="300" x2="380" y2="300" />
        <circle pathLength="1" cx="200" cy="300" r="55" />
        <rect pathLength="1" x="100" y="20" width="200" height="90" />
        <rect pathLength="1" x="150" y="20" width="100" height="35" />
        <path pathLength="1" d="M 160 110 A 45 45 0 0 0 240 110" />
        <rect pathLength="1" x="100" y="490" width="200" height="90" />
        <rect pathLength="1" x="150" y="545" width="100" height="35" />
        <path pathLength="1" d="M 160 490 A 45 45 0 0 1 240 490" />
      </g>
      <circle cx="200" cy="300" r="3" fill="currentColor" />
    </svg>
  );
}

function Brand({ className = "" }) {
  return (
    <div className={`flex items-center gap-3 font-display text-xl font-bold uppercase tracking-wide ${className}`}>
      <span className="flex size-9 items-center justify-center rounded-xl bg-lime text-lg shadow-lg shadow-lime/30">
        ⚽
      </span>
      Football Team Manager
    </div>
  );
}

function MatchdayCard() {
  return (
    <div className="animate-float rounded-2xl border border-white/15 bg-white/10 p-5 shadow-2xl shadow-black/30 backdrop-blur-md">
      <div className="flex items-center justify-between text-xs font-semibold uppercase tracking-[0.2em] text-pitch-200">
        <span>CLUB DE OBLIVION</span>
        <span className="flex items-center gap-2 text-lime">
          <span className="relative flex size-2">
            <span className="absolute inline-flex size-full animate-ping rounded-full bg-lime opacity-75" />
            <span className="relative inline-flex size-2 rounded-full bg-lime" />
          </span>
          Open
        </span>
      </div>

      <p className="mt-3 font-display text-3xl font-bold uppercase leading-none">vs Uttara United</p>
      <p className="mt-1 text-sm text-pitch-100">Fri · 8:00 PM · Bashundhara Turf</p>

      <div className="mt-5 flex items-baseline justify-between text-sm">
        <span className="text-pitch-100">Seats secured</span>
        <span className="font-display text-xl font-bold">
          11<span className="text-pitch-200"> / 14</span>
        </span>
      </div>
      <div className="mt-2 h-2 overflow-hidden rounded-full bg-white/15">
        <div
          className="h-full w-[78%] origin-left animate-fill rounded-full bg-lime"
          style={{ animationDelay: "1s" }}
        />
      </div>

      <div className="mt-5 flex items-center justify-between">
        <div className="flex -space-x-2">
          {SQUAD.map((player) => (
            <span
              key={player.initials}
              className={`flex size-8 items-center justify-center rounded-full text-[11px] font-bold ring-2 ring-pitch-900 ${player.color}`}
            >
              {player.initials}
            </span>
          ))}
        </div>
        <span className="rounded-full bg-lime px-3 py-1 text-xs font-bold uppercase tracking-wide text-pitch-950">
          🔒 Seat secured
        </span>
      </div>
    </div>
  );
}

export default function AuthLayout({ eyebrow, title, subtitle, children, footer }) {
  return (
    <div className="flex min-h-screen">
      {/* ---------- Left: the floodlit pitch (large screens only) ---------- */}
      <aside className="relative hidden w-[52%] flex-col justify-between overflow-hidden bg-pitch-900 p-12 text-white lg:flex xl:p-16">
        {/* floodlight glows */}
        <div className="pointer-events-none absolute -left-24 -top-24 size-[28rem] animate-drift rounded-full bg-lime/15 blur-3xl" />
        <div
          className="pointer-events-none absolute -bottom-32 right-0 size-[32rem] animate-drift rounded-full bg-pitch-500/25 blur-3xl"
          style={{ animationDelay: "-8s" }}
        />
        <div className="pointer-events-none absolute inset-0 text-white/[0.08]">
          <PitchLines />
        </div>

        <Brand className="relative animate-fade-in" />

        <div className="relative">
          <h2 className="font-display text-6xl font-extrabold uppercase leading-[0.88] xl:text-7xl">
            <span className="block animate-fade-up" style={{ animationDelay: "150ms" }}>
              Run your team
            </span>
            <span className="block animate-fade-up" style={{ animationDelay: "300ms" }}>
              like <span className="text-lime">matchday.</span>
            </span>
          </h2>
          <p className="mt-6 max-w-md animate-fade-up text-lg text-pitch-100" style={{ animationDelay: "450ms" }}>
            Seats, fees, squads and stats for your local football team, all in one place.
          </p>
          <div className="mt-10 max-w-sm animate-fade-up" style={{ animationDelay: "650ms" }}>
            <MatchdayCard />
          </div>
        </div>

        <ul className="relative flex animate-fade-in flex-wrap gap-x-8 gap-y-3 text-sm text-pitch-100" style={{ animationDelay: "1s" }}>
          {FEATURES.map(({ icon: Icon, text }) => (
            <li key={text} className="flex items-center gap-2">
              <Icon className="size-4 text-lime" />
              {text}
            </li>
          ))}
        </ul>
      </aside>

      {/* ---------- Right: the form ---------- */}
      <main className="relative flex w-full flex-col items-center justify-center px-5 py-12 lg:w-[48%]">
        <div className="w-full max-w-sm">
          <Brand className="mb-12 text-pitch-900 lg:hidden" />
          <div className="stagger">
            {eyebrow && (
              <p className="text-xs font-bold uppercase tracking-[0.25em] text-pitch-600">{eyebrow}</p>
            )}
            <h1 className="mt-2 font-display text-5xl font-bold uppercase leading-none tracking-wide text-pitch-950">
              {title}
            </h1>
            {subtitle && <p className="mt-3 text-slate-500">{subtitle}</p>}
            <div className="mt-8">{children}</div>
            {footer && <p className="mt-8 text-sm text-slate-600">{footer}</p>}
          </div>
        </div>
        <p className="absolute bottom-6 text-xs text-slate-400">
          © {new Date().getFullYear()} Football Team Manager
        </p>
      </main>
    </div>
  );
}