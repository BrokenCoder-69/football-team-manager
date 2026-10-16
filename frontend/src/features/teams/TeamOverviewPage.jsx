import { CalendarClock, Check, Copy, RefreshCw, ShieldCheck, UserPlus, Users } from "lucide-react";
import { useState } from "react";
import { Link, useOutletContext } from "react-router";
import ActionButton from "../../components/ActionButton";
import { ROLE_LABEL, isAdmin, isManager } from "../../lib/roles";
import { useMembers, useRegenerateInvite } from "./hooks";

function StatTile({ label, value, icon: Icon, to, highlight = false }) {
  const tile = (
    <div
      className={`h-full rounded-2xl border bg-white p-5 shadow-sm transition ${
        highlight ? "border-lime ring-4 ring-lime/40" : "border-slate-200"
      } ${to ? "hover:-translate-y-0.5 hover:shadow-md" : ""}`}
    >
      <div className="flex items-center justify-between text-slate-400">
        <span className="text-xs font-bold uppercase tracking-widest">{label}</span>
        <Icon className="size-4" />
      </div>
      <p className="mt-3 font-display text-4xl font-bold text-pitch-950">{value}</p>
    </div>
  );
  return to ? <Link to={to}>{tile}</Link> : tile;
}

function InviteCard({ team }) {
  const [copied, setCopied] = useState(false);
  const regenerate = useRegenerateInvite(team.id);

  async function copy() {
    await navigator.clipboard.writeText(team.invite_code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  function makeNewCode() {
    if (window.confirm("Make a new code? The current one will stop working.")) {
      regenerate.mutate();
    }
  }

  return (
    <div className="relative overflow-hidden rounded-2xl bg-pitch-900 p-6 text-white shadow-lg">
      <div className="pointer-events-none absolute -bottom-16 -right-10 size-48 rounded-full bg-lime/10 blur-2xl" />
      <p className="relative text-xs font-bold uppercase tracking-[0.2em] text-pitch-200">Invite code</p>
      <p className="relative mt-3 font-mono text-4xl font-bold tracking-[0.25em] text-lime">{team.invite_code}</p>
      <p className="relative mt-2 text-sm text-pitch-100">
        Share it with players. They tap "Join a team", then you approve them here.
      </p>
      <div className="relative mt-5 flex flex-wrap gap-2">
        <ActionButton variant="lime" size="sm" icon={copied ? Check : Copy} onClick={copy}>
          {copied ? "Copied!" : "Copy code"}
        </ActionButton>
        {isAdmin(team.my_role) && (
          <ActionButton variant="glass" size="sm" icon={RefreshCw} loading={regenerate.isPending} onClick={makeNewCode}>
            New code
          </ActionButton>
        )}
      </div>
    </div>
  );
}

export default function TeamOverviewPage() {
  const { team } = useOutletContext();
  const manager = isManager(team.my_role);
  const { data: pending = [] } = useMembers(team.id, "pending", { enabled: manager });

  return (
    <div className="grid gap-6 lg:grid-cols-3">
      <div className="space-y-6 lg:col-span-2">
        <div className="stagger grid gap-4 sm:grid-cols-3">
          <StatTile label="Members" value={team.member_count} icon={Users} to="members" />
          <StatTile label="Your role" value={ROLE_LABEL[team.my_role]} icon={ShieldCheck} />
          {manager && (
            <StatTile label="Join requests" value={pending.length} icon={UserPlus} to="members" highlight={pending.length > 0} />
          )}
        </div>

        <div className="flex flex-col items-center rounded-2xl border-2 border-dashed border-slate-300 bg-white/60 px-6 py-12 text-center">
          <CalendarClock className="size-10 text-slate-300" />
          <p className="mt-3 font-display text-2xl font-bold uppercase text-slate-400">Next match</p>
          <p className="mt-1 text-sm text-slate-400">Matches, seats and payments arrive in M3–M5.</p>
        </div>

        {team.description && (
          <div className="rounded-2xl border border-slate-200 bg-white p-6">
            <p className="text-xs font-bold uppercase tracking-widest text-slate-400">About</p>
            <p className="mt-2 whitespace-pre-line text-slate-700">{team.description}</p>
          </div>
        )}
      </div>

      <div className="space-y-6">
        {manager ? (
          <InviteCard team={team} />
        ) : (
          <div className="rounded-2xl border border-slate-200 bg-white p-6">
            <p className="font-display text-2xl font-bold uppercase text-pitch-950">Bring a teammate</p>
            <p className="mt-2 text-sm text-slate-500">Ask your captain or an admin for the team's invite code.</p>
          </div>
        )}
      </div>
    </div>
  );
}