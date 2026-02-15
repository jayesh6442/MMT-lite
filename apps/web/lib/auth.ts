export const API_URL =
  process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000";

export const AUTH_TOKEN_KEY = "mmt_prime_auth_token";

export type AuthUser = {
  id: string;
  email: string | null;
  name: string | null;
};
