const PALETTE = [
  "bg-amber-200 text-amber-900",
  "bg-sky-200 text-sky-900",
  "bg-rose-200 text-rose-900",
  "bg-violet-200 text-violet-900",
  "bg-emerald-200 text-emerald-900",
  "bg-orange-200 text-orange-900",
];

const SIZES = { sm: "size-8 text-xs", md: "size-10 text-sm", lg: "size-14 text-lg" };

export default function Avatar({ name = "", size = "md" }) {
  const letters =
    name
      .split(" ")
      .filter(Boolean)
      .slice(0, 2)
      .map((part) => part[0].toUpperCase())
      .join("") || "?";

  // The same name always gets the same colour.
  let hash = 0;
  for (const char of name) hash = (hash + char.charCodeAt(0)) % PALETTE.length;

  return (
    <span
      aria-hidden="true"
      className={`inline-flex shrink-0 items-center justify-center rounded-full font-bold ${SIZES[size]} ${PALETTE[hash]}`}
    >
      {letters}
    </span>
  );
}