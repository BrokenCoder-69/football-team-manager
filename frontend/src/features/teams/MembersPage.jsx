import { Check, LogOut, UserMinus, X } from "lucide-react";
import { useState } from "react";
import { useNavigate, useOutletContext } from "react-router";
import { errorMessages } from "../../api/errors";
import { useAuth } from "../../auth/useAuth";
import ActionButton from "../../components/ActionButton";
import Avatar from "../../components/Avatar";
import RoleBadge from "../../components/RoleBadge";
import { ROLE_LABEL, assignableRoles, isAdmin, isManager, outranks } from "../../lib/roles";
import { useLeaveTeam, useMemberAction, useMembers } from "./hooks";

function Card({ title, count, children }) {
  return (
    <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
      <header className="flex items-center gap-3 border-b border-slate-100 px-5 py-4">
        <h2 className="font-display text-xl font-bold uppercase text-pitch-950">{title}</h2>
        <span className="rounded-full bg-slate-100 px-2 py-0.5 text-xs font-bold text-slate-500">{count}</span>
      </header>
      <ul className="divide-y divide-slate-100">{children}</ul>
    </section>
  );
}

function SkeletonRows() {
  return [1, 2, 3].map((n) => (
    <li key={n} className="flex animate-pulse items-center gap-3 px-5 py-4">
      <div className="size-10 rounded-full bg-slate-200" />
      <div className="h-4 w-40 rounded bg-slate-200" />
    </li>
  ));
}

export default function MembersPage() {
  const { team } = useOutletContext();
  const { user } = useAuth();
  const navigate = useNavigate();
  const myRole = team.my_role;
  const manager = isManager(myRole);

  const members = useMembers(team.id, "active");
  const pending = useMembers(team.id, "pending", { enabled: manager });
  const action = useMemberAction(team.id);
  const leave = useLeaveTeam(team.id);
  const [error, setError] = useState("");

  function run(memberId, actionName, body, confirmText) {
    if (confirmText && !window.confirm(confirmText)) return;
    setError("");
    action.mutate(
      { memberId, action: actionName, body },
      { onError: (err) => setError(Object.values(errorMessages(err))[0]) },
    );
  }

  // One mutation serves every row; `variables` tells us which row is busy.
  const isBusy = (memberId) => action.isPending && action.variables?.memberId === memberId;

  function leaveTeam() {
    if (window.confirm(`Leave ${team.name}? You'll need a new invite to come back.`)) {
      leave.mutate(undefined, { onSuccess: () => navigate("/teams") });
    }
  }

  return (
    <div className="space-y-6">
      {error && (
        <div role="alert" className="animate-shake rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </div>
      )}

      {manager && pending.data?.length > 0 && (
        <Card title="Join requests" count={pending.data.length}>
          {pending.data.map((request) => (
            <li key={request.id} className="flex flex-wrap items-center gap-3 bg-lime/10 px-5 py-4">
              <Avatar name={request.user.name} />
              <div className="min-w-0 flex-1">
                <p className="font-semibold text-slate-900">{request.user.name}</p>
                <p className="text-sm text-slate-500">{request.user.phone || "No phone added"}</p>
              </div>
              <ActionButton size="sm" icon={Check} loading={isBusy(request.id)} onClick={() => run(request.id, "approve")}>
                Approve
              </ActionButton>
              <ActionButton size="sm" variant="secondary" icon={X} disabled={isBusy(request.id)} onClick={() => run(request.id, "reject")}>
                Decline
              </ActionButton>
            </li>
          ))}
        </Card>
      )}

      <Card title="Squad" count={members.data?.length ?? "…"}>
        {members.isPending ? (
          <SkeletonRows />
        ) : (
          members.data.map((member) => {
            const isMe = member.user.id === user.id;
            const canManage = manager && !isMe && outranks(myRole, member.role);
            const details = [member.position, member.jersey_number && `#${member.jersey_number}`]
              .filter(Boolean)
              .join(" · ");

            return (
              <li key={member.id} className="flex flex-wrap items-center gap-3 px-5 py-4">
                <Avatar name={member.user.name} />
                <div className="min-w-0 flex-1">
                  <p className="flex items-center gap-2 font-semibold text-slate-900">
                    {member.user.name}
                    {isMe && <span className="rounded bg-pitch-50 px-1.5 py-0.5 text-[10px] font-bold uppercase text-pitch-700">You</span>}
                  </p>
                  <p className="text-sm text-slate-500">{details || "No position set yet"}</p>
                </div>

                {canManage && isAdmin(myRole) ? (
                  <select
                    value={member.role}
                    disabled={isBusy(member.id)}
                    onChange={(event) => run(member.id, "role", { role: event.target.value })}
                    className="rounded-lg border border-slate-300 bg-white px-2.5 py-1.5 text-sm font-medium focus:border-pitch-600 focus:outline-none"
                  >
                    {assignableRoles(myRole).map((role) => (
                      <option key={role} value={role}>
                        {ROLE_LABEL[role]}
                      </option>
                    ))}
                  </select>
                ) : (
                  <RoleBadge role={member.role} />
                )}

                {canManage && (
                  <button
                    onClick={() => run(member.id, "remove", {}, `Remove ${member.user.name} from ${team.name}?`)}
                    disabled={isBusy(member.id)}
                    title="Remove from team"
                    aria-label={`Remove ${member.user.name}`}
                    className="rounded-lg p-2 text-slate-400 transition hover:bg-red-50 hover:text-red-600 disabled:opacity-50"
                  >
                    <UserMinus className="size-5" />
                  </button>
                )}
              </li>
            );
          })
        )}
      </Card>

      {myRole !== "owner" && (
        <div className="flex justify-end">
          <ActionButton variant="ghost" icon={LogOut} loading={leave.isPending} onClick={leaveTeam}>
            Leave team
          </ActionButton>
        </div>
      )}
    </div>
  );
}