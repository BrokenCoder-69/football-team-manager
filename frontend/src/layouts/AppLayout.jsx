import { Check, ChevronsUpDown, LogOut, Plus } from "lucide-react";
import { useState } from "react";
import { Link, Outlet, useMatch, useNavigate } from "react-router";
import { useAuth } from "../auth/useAuth";
import Avatar from "../components/Avatar";
import { useTeams } from "../features/teams/hooks";

function TeamSwitcher() {
  const match = useMatch("/teams/:teamId/*");
  const currentId = match?.params.teamId;
  const { data: teams = [] } = useTeams();
  const [open, setOpen] = useState(false);
  const navigate = useNavigate();
  const current = teams.find((team) => String(team.id) === currentId);

  function go(path) {
    setOpen(false);
    navigate(path);
  }

  return (
    <div className="relative">
      <button
        onClick={() => setOpen(!open)}
        className="flex items-center gap-2 rounded-lg px-3 py-1.5 text-sm font-semibold text-white/90 transition hover:bg-white/10"
      >
        <span className="size-2.5 rounded-full" style={{ backgroundColor: current?.primary_color || "#d4ff3a" }} />
        <span className="max-w-[10rem] truncate">{current ? current.name : "All teams"}</span>
        <ChevronsUpDown className="size-4 text-white/60" />
      </button>

      {open && (
        <>
          {/* invisible full-screen button: clicking anywhere outside closes the menu */}
          <button aria-label="Close menu" className="fixed inset-0 z-10 cursor-default" onClick={() => setOpen(false)} />
          <div className="absolute left-0 z-20 mt-2 w-64 animate-fade-up rounded-xl border border-slate-200 bg-white p-1.5 text-slate-800 shadow-xl">
            <p className="px-3 pb-1 pt-2 text-xs font-bold uppercase tracking-widest text-slate-400">Your teams</p>
            {teams.map((team) => (
              <button
                key={team.id}
                onClick={() => go(`/teams/${team.id}`)}
                className="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-left text-sm hover:bg-slate-50"
              >
                <span className="size-2.5 shrink-0 rounded-full" style={{ backgroundColor: team.primary_color || "#0b3d24" }} />
                <span className="flex-1 truncate font-medium">{team.name}</span>
                {String(team.id) === currentId && <Check className="size-4 text-pitch-600" />}
              </button>
            ))}
            <div className="my-1 border-t border-slate-100" />
            <button
              onClick={() => go("/teams")}
              className="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-left text-sm font-medium text-pitch-700 hover:bg-pitch-50"
            >
              <Plus className="size-4" /> Create or join a team
            </button>
          </div>
        </>
      )}
    </div>
  );
}

export default function AppLayout() {
  const { user, logout } = useAuth();

  return (
    <div className="min-h-screen">
      <header className="sticky top-0 z-30 bg-pitch-900 text-white shadow-lg shadow-pitch-950/20">
        <div className="mx-auto flex h-16 max-w-6xl items-center gap-3 px-4">
          <Link to="/teams" className="flex items-center gap-2.5 font-display text-lg font-bold uppercase tracking-wide">
            <span className="flex size-8 items-center justify-center rounded-lg bg-lime text-base">⚽</span>
            <span className="hidden sm:inline">Football Manager</span>
          </Link>
          <span className="h-6 w-px bg-white/15" />
          <TeamSwitcher />

          <div className="ml-auto flex items-center gap-3">
            <div className="hidden text-right sm:block">
              <p className="text-sm font-semibold leading-tight">{user.name}</p>
              <p className="text-xs text-pitch-200">{user.email}</p>
            </div>
            <Avatar name={user.name} size="sm" />
            <button
              onClick={logout}
              title="Log out"
              aria-label="Log out"
              className="rounded-lg p-2 text-pitch-200 transition hover:bg-white/10 hover:text-white"
            >
              <LogOut className="size-5" />
            </button>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-6xl px-4 py-8">
        <Outlet />
      </main>
    </div>
  );
}