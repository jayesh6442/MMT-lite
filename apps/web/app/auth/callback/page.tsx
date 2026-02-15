"use client";

import { useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { AUTH_TOKEN_KEY } from "../../../lib/auth";

export default function AuthCallbackPage() {
  const router = useRouter();
  const searchParams = useSearchParams();

  useEffect(() => {
    const token = searchParams.get("token");
    if (!token) {
      router.replace("/?error=missing_token");
      return;
    }

    window.localStorage.setItem(AUTH_TOKEN_KEY, token);
    router.replace("/");
  }, [router, searchParams]);

  return (
    <main style={{ padding: "2rem", fontFamily: "sans-serif" }}>
      <p>Signing you in...</p>
    </main>
  );
}
