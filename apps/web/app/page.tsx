"use client";

import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { API_URL, AUTH_TOKEN_KEY, type AuthUser } from "../lib/auth";

export default function IndexPage() {
  const searchParams = useSearchParams();
  const [isLoading, setIsLoading] = useState(true);
  const [token, setToken] = useState<string | null>(null);
  const [user, setUser] = useState<AuthUser | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const storedToken = window.localStorage.getItem(AUTH_TOKEN_KEY);
    if (!storedToken) {
      setIsLoading(false);
      return;
    }

    setToken(storedToken);

    const loadSession = async () => {
      try {
        const response = await fetch(`${API_URL}/auth/me`, {
          headers: {
            Authorization: `Bearer ${storedToken}`,
          },
        });

        if (!response.ok) {
          throw new Error("Session expired. Please sign in again.");
        }

        const body = (await response.json()) as { user: AuthUser };
        setUser(body.user);
        setError(null);
      } catch (sessionError) {
        const message =
          sessionError instanceof Error
            ? sessionError.message
            : "Could not load session.";
        setError(message);
        setToken(null);
        setUser(null);
        window.localStorage.removeItem(AUTH_TOKEN_KEY);
      } finally {
        setIsLoading(false);
      }
    };

    void loadSession();
  }, []);

  const loginUrl = `${API_URL}/auth/google`;
  const oauthError =
    searchParams.get("error") === "oauth_failed"
      ? "Google authentication failed."
      : null;

  const logout = () => {
    window.localStorage.removeItem(AUTH_TOKEN_KEY);
    setToken(null);
    setUser(null);
    setError(null);
  };

  return (
    <main style={{ padding: "2rem", fontFamily: "sans-serif" }}>
      <h1>MMT Prime Auth</h1>

      {isLoading ? <p>Checking session...</p> : null}

      {!isLoading && !token ? (
        <a href={loginUrl}>Continue with Google</a>
      ) : null}

      {!isLoading && token && user ? (
        <section>
          <p>
            Signed in as <strong>{user.name ?? user.email}</strong>
          </p>
          <p>Email: {user.email}</p>
          <button type="button" onClick={logout}>
            Log out
          </button>
        </section>
      ) : null}

      {!isLoading && (error ?? oauthError) ? (
        <p style={{ color: "crimson" }}>{error ?? oauthError}</p>
      ) : null}
    </main>
  );
}
