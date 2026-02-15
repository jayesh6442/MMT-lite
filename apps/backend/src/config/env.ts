import { config as loadEnv } from "dotenv";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const envPaths = [
  path.resolve(__dirname, "../../.env"),
  path.resolve(__dirname, "../../../../packages/database/.env"),
  path.resolve(__dirname, "../../../../.env"),
];

for (const envPath of envPaths) {
  loadEnv({ path: envPath, override: false });
}

const requireEnv = (key: string): string => {
  const value = process.env[key];
  if (!value) {
    throw new Error(`Missing required environment variable: ${key}`);
  }

  return value;
};

const backendUrl = process.env.BACKEND_URL ?? "http://localhost:4000";
const normalizedBackendUrl = backendUrl.replace(/\/$/, "");
const frontendUrl = requireEnv("FRONTEND_URL").replace(/\/$/, "");
const backendUrlPort = (() => {
  try {
    const parsed = new URL(normalizedBackendUrl);
    return parsed.port ? Number(parsed.port) : 4000;
  } catch {
    return 4000;
  }
})();

export const env = {
  GOOGLE_CLIENT_ID: requireEnv("GOOGLE_CLIENT_ID"),
  GOOGLE_CLIENT_SECRET: requireEnv("GOOGLE_CLIENT_SECRET"),
  JWT_SECRET: requireEnv("JWT_SECRET"),
  FRONTEND_URL: frontendUrl,
  DATABASE_URL: requireEnv("DATABASE_URL"),
  BACKEND_URL: normalizedBackendUrl,
  PORT: Number(process.env.PORT ?? backendUrlPort),
};
