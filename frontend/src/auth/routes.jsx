import { Navigate, Outlet, useLocation } from "react-router";
import { useAuth } from "./useAuth";

function FullPageMessage({ children }) {
  return (
    <div className="flex min-h-screen items-center justify-center text-slate-500">
      {children}
    </div>
  );
}

// Pages inside this need a logged-in user. Others are sent to /login,
// remembering where they were heading.
export function ProtectedRoute() {
  const { status } = useAuth();
  const location = useLocation();

  if (status === "loading") return <FullPageMessage>Loading…</FullPageMessage>;
  if (status === "anonymous") {
    return <Navigate to="/login" replace state={{ from: location }} />;
  }
  return <Outlet />;
}

// Pages inside this (login, register) are only for logged-out users.
// As soon as someone logs in, this sends them where they were heading.
export function GuestOnlyRoute() {
  const { status } = useAuth();
  const location = useLocation();

  if (status === "loading") return <FullPageMessage>Loading…</FullPageMessage>;
  if (status === "authenticated") {
    const goTo = location.state?.from?.pathname ?? "/";
    return <Navigate to={goTo} replace />;
  }
  return <Outlet />;
}