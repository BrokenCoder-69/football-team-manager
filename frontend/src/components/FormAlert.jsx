import { CircleAlert } from "lucide-react";

// `attempt` changes on every failed submit. Using it as the `key` makes React
// rebuild the box, which replays the shake even if the message is the same.
export default function FormAlert({ message, attempt }) {
  if (!message) return null;

  return (
    <div
      key={attempt}
      role="alert"
      className="flex animate-shake items-start gap-2.5 rounded-xl border border-red-200 bg-red-50 px-3.5 py-3 text-sm text-red-700"
    >
      <CircleAlert className="mt-0.5 size-4 shrink-0" />
      {message}
    </div>
  );
}