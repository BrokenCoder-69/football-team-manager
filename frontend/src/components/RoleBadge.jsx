import { ROLE_LABEL } from "../lib/roles";

const STYLES = {
  owner: "bg-lime text-pitch-950",
  admin: "bg-pitch-100 text-pitch-800",
  captain: "bg-amber-100 text-amber-800",
  player: "bg-slate-100 text-slate-600",
};

export default function RoleBadge({ role }) {
  if (!role) return null;
  return (
    <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-bold uppercase tracking-wide ${STYLES[role]}`}>
      {ROLE_LABEL[role]}
    </span>
  );
}