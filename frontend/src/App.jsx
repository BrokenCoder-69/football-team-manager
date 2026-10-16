import { BrowserRouter, Navigate, Route, Routes } from "react-router";
import AuthProvider from "./auth/AuthProvider";
import { GuestOnlyRoute, ProtectedRoute } from "./auth/routes";
import LoginPage from "./features/auth/LoginPage";
import RegisterPage from "./features/auth/RegisterPage";
import MembersPage from "./features/teams/MembersPage";
import MyTeamsPage from "./features/teams/MyTeamsPage";
import TeamLayout from "./features/teams/TeamLayout";
import TeamOverviewPage from "./features/teams/TeamOverviewPage";
import AppLayout from "./layouts/AppLayout";

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          <Route element={<GuestOnlyRoute />}>
            <Route path="/login" element={<LoginPage />} />
            <Route path="/register" element={<RegisterPage />} />
          </Route>

          <Route element={<ProtectedRoute />}>
            <Route element={<AppLayout />}>
              <Route path="/teams" element={<MyTeamsPage />} />
              <Route path="/teams/:teamId" element={<TeamLayout />}>
                <Route index element={<TeamOverviewPage />} />
                <Route path="members" element={<MembersPage />} />
              </Route>
            </Route>
          </Route>

          <Route path="*" element={<Navigate to="/teams" replace />} />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
}