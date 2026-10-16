import { ArrowRight, KeyRound, MapPin, Plus, Trophy, Users } from "lucide-react";
import { useState } from "react";
import { Link } from "react-router";
import { useAuth } from "../../auth/useAuth";
import ActionButton from "../../components/ActionButton";
import RoleBadge from "../../components/RoleBadge";
import { EmptyState, ErrorState } from "../../components/States";
import CreateTeamModal from "./CreateTeamModal";
import JoinTeamModal from "./JoinTeamModal";
import { useTeams } from "./hooks";

function TeamCard({ team }) {
  const color = team.primary_color || "#0b3d24";
  return (
    <Link
      to={`/teams/${team.id}`}
      className="group relative block overflow-hidden rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition hover:-translate-y-1 hover:shadow-xl hover:shadow-pitch-900/10"
    >
      <div className="absolute inset-x-0 top-0 h-1.5" style={{ backgroundColor: color }} />
      <div className="flex items-start justify-between">
        <div
          className="flex size-12 items-center justify-center rounded-xl font-display text-xl font-bold uppercase text-white"
          style={{ backgroundColor: color }}
        >
          {team.name.slice(0, 2)}
        </div>
        <RoleBadge role={team.my_role} />
      </div>
      <h3 className="mt-4 font-display text-2xl font-bold uppercase leading-tight text-pitch-950">{team.name}</h3>
      {team.location && (
        <p className="mt-1 flex items-center gap-1.5 text-sm text-slate-500">
          <MapPin className="size-3.5" />
          {team.location}
        </p>
      )}
      <div className="mt-5 flex items-center justify-between border-t border-slate-100 pt-4 text-sm text-slate-500">
        <span className="flex items-center gap-1.5">
          <Users className="size-4" />
          {team.member_count} {team.member_count === 1 ? "member" : "members"}
        </span>
        <ArrowRight className="size-4 text-pitch-700 transition group-hover:translate-x-1" />
      </div>
    </Link>
  );
}

function SkeletonCard() {
  return (
    <div className="animate-pulse rounded-2xl border border-slate-200 bg-white p-5">
      <div className="size-12 rounded-xl bg-slate-200" />
      <div className="mt-4 h-6 w-2/3 rounded bg-slate-200" />
      <div className="mt-2 h-4 w-1/3 rounded bg-slate-100" />
      <div className="mt-6 h-4 w-1/2 rounded bg-slate-100" />
    </div>
  );
}

export default function MyTeamsPage() {
  const { user } = useAuth();
  const { data: teams, isPending, error } = useTeams();
  const [modal, setModal] = useState(null); // "create" | "join" | null
  const firstName = user.name.split(" ")[0];

  return (
    <div>
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div className="animate-fade-up">
          <p className="text-xs font-bold uppercase tracking-[0.25em] text-pitch-600">Hey {firstName} 👋</p>
          <h1 className="mt-1 font-display text-5xl font-extrabold uppercase leading-none text-pitch-950">Your teams</h1>
        </div>
        <div className="flex gap-2">
          <ActionButton variant="secondary" icon={KeyRound} onClick={() => setModal("join")}>
            Join a team
          </ActionButton>
          <ActionButton icon={Plus} onClick={() => setModal("create")}>
            Create team
          </ActionButton>
        </div>
      </div>

      <div className="mt-8">
        {isPending ? (
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            <SkeletonCard />
            <SkeletonCard />
            <SkeletonCard />
          </div>
        ) : error ? (
          <ErrorState message="We couldn't load your teams. Is the backend running?" />
        ) : teams.length === 0 ? (
          <EmptyState
            icon={Trophy}
            title="No teams yet"
            message="Create a team for your squad, or join one with the invite code from your captain."
          >
            <ActionButton variant="secondary" icon={KeyRound} onClick={() => setModal("join")}>
              Join with a code
            </ActionButton>
            <ActionButton icon={Plus} onClick={() => setModal("create")}>
              Create your first team
            </ActionButton>
          </EmptyState>
        ) : (
          <div className="stagger grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {teams.map((team) => (
              <TeamCard key={team.id} team={team} />
            ))}
          </div>
        )}
      </div>

      <CreateTeamModal open={modal === "create"} onClose={() => setModal(null)} />
      <JoinTeamModal open={modal === "join"} onClose={() => setModal(null)} />
    </div>
  );
}