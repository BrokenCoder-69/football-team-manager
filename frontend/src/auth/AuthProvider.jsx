import { useEffect, useState } from "react";
import * as authApi from "../api/auth";
import { setSessionExpiredHandler } from "../api/client";
import { AuthContext } from "./context";

export default function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  // "loading" until we know whether a session exists; then
  // "authenticated" or "anonymous".
  const [status, setStatus] = useState("loading");

  useEffect(() => {
    setSessionExpiredHandler(() => {
      setUser(null);
      setStatus("anonymous");
    });

    authApi
      .restoreSession()
      .then((me) => {
        setUser(me);
        setStatus("authenticated");
      })
      .catch(() => setStatus("anonymous"));
  }, []);

  async function login(email, password) {
    const me = await authApi.login(email, password);
    setUser(me);
    setStatus("authenticated");
  }

  async function register(details) {
    await authApi.register(details);
    await login(details.email, details.password);
  }

  async function logout() {
    await authApi.logout();
    setUser(null);
    setStatus("anonymous");
  }

  const value = { user, status, login, register, logout };
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}