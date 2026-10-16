import { useAuth } from "../../auth/useAuth";

export default function HomePage() {
  const { user, logout } = useAuth();

  return (
    <div className="mx-auto max-w-2xl px-4 py-10">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">⚽ Football Team Manager</h1>
        <button
          onClick={logout}
          className="rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-sm hover:bg-slate-50"
        >
          Log out
        </button>
      </div>
      <div className="mt-6 rounded-2xl bg-white p-6 shadow-sm">
        <p className="text-lg">
          Welcome, <strong>{user.name}</strong> 👋
        </p>
        <p className="mt-1 text-slate-500">{user.email}</p>
        <p className="mt-4 text-sm text-slate-500">Your teams will appear here in M2.</p>
      </div>
    </div>
  );
}