import { ArrowLeft, CalendarDays, LayoutDashboard, MapPin, Users, Wallet } from "lucide-react";
import { Link, NavLink, Outlet, useParams } from "react-router";
import ActionButton from "../../components/ActionButton";
import RoleBadge from "../../components/RoleBadge";
import { ErrorState, PageLoader } from "../../components/States";
import { useTeam } from "./hooks";

const TABS = [
  { to: "", label: "Overview", icon: LayoutDashboard, end: true },
  { to: "members", label: "Members", icon: Users },
  { label: "Matches", icon: CalendarDays, soon: "M3" },
  { label: "Finance", icon: Wallet, soon: "M5" },
];

export default function TeamLayout() {
  const { teamId } = useParams();
  const { data: team, isPending, error } = useTeam(teamId);

  if (isPending) return <PageLoader />;
  if (error) {
    return (
      <ErrorState title="Team not found" message="It doesn't exist, or you're not an active member of it.">
        <Link to="/teams">
          <ActionButton variant="secondary" icon={ArrowLeft}>Back to your teams</ActionButton>
        </Link>
      </ErrorState>
    );
  }

  const color = team.primary_color || "#0b3d24";

  return (
    <div className="animate-fade-up">
      <section className="relative overflow-hidden rounded-3xl bg-pitch-900 p-6 text-white shadow-xl shadow-pitch-900/20 sm:p-8">
        <div className="absolute inset-y-0 left-0 w-2" style={{ backgroundColor: color }} />
        <div className="pointer-events-none absolute -right-16 -top-24 size-80 rounded-full bg-lime/10 blur-3xl" />
        <div className="relative flex flex-wrap items-end justify-between gap-4">
          <div>
            <RoleBadge role={team.my_role} />
            <h1 className="mt-3 font-display text-5xl font-extrabold uppercase leading-none sm:text-6xl">{team.name}</h1>
            {team.location && (
              <p className="mt-2 flex items-center gap-1.5 text-pitch-100">
                <MapPin className="size-4" />
                {team.location}
              </p>
            )}
          </div>
          <p className="text-sm uppercase tracking-widest text-pitch-200">
            <span className="mr-2 font-display text-4xl font-bold tracking-normal text-white">{team.member_count}</span>
            members
          </p>
        </div>
      </section>

      <nav className="mt-6 flex gap-1 overflow-x-auto border-b border-slate-200">
        {TABS.map((tab) =>
          tab.soon ? (
            <span key={tab.label} className="flex shrink-0 cursor-not-allowed items-center gap-2 px-4 py-3 text-sm font-semibold text-slate-400">
              <tab.icon className="size-4" />
              {tab.label}
              <span className="rounded bg-slate-100 px-1.5 py-0.5 text-[10px] font-bold uppercase">{tab.soon}</span>
            </span>
          ) : (
            <NavLink
              key={tab.label}
              to={tab.to}
              end={tab.end}
              className={({ isActive }) =>
                `-mb-px flex shrink-0 items-center gap-2 border-b-2 px-4 py-3 text-sm font-semibold transition ${
                  isActive ? "border-pitch-900 text-pitch-900" : "border-transparent text-slate-500 hover:text-slate-800"
                }`
              }
            >
              <tab.icon className="size-4" />
              {tab.label}
            </NavLink>
          ),
        )}
      </nav>

      <div className="mt-6">
        {/* Child pages read `team` with useOutletContext() instead of fetching it again. */}
        <Outlet context={{ team }} />
      </div>
    </div>
  );
}