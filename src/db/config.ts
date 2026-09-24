import type { PoolConfig } from "pg";

const LOCAL_HOSTS = new Set(["localhost", "127.0.0.1", "::1"]);

function hostOf(url: string): string {
  try {
    return new URL(url).hostname.replace(/^\[|\]$/g, "");
  } catch {
    // Unencoded special characters in the password can break URL parsing; fall back to the text after "@".
    return url.split("@").pop()?.split(/[:/?]/)[0] ?? "";
  }
}

/**
 * Connection settings for a Postgres URL, shared by the app and the scripts.
 *
 * - Local hosts and `sslmode=disable` connect without TLS.
 * - Every other host is always encrypted. When `DATABASE_CA_CERT` is set (for Supabase, the CA certificate from
 *   Project Settings -> Database -> SSL), the server certificate is verified as well.
 * - Any `sslmode` in the URL is removed, because node-postgres lets it override the `ssl` object and treats
 *   `require` as full verification, which fails against providers that sign with their own CA.
 */
export function pgConfig(url: string): Pick<PoolConfig, "connectionString" | "ssl"> {
  const disable = /[?&]sslmode=disable\b/.test(url);
  const connectionString = url
    .replace(/([?&])sslmode=[^&]*&?/, "$1")
    .replace(/[?&]$/, "");
  if (disable || LOCAL_HOSTS.has(hostOf(url))) return { connectionString, ssl: false };
  const ca = (process.env.DATABASE_CA_CERT ?? "").replace(/\\n/g, "\n").trim();
  return { connectionString, ssl: ca ? { ca, rejectUnauthorized: true } : { rejectUnauthorized: false } };
}

/** Reads DATABASE_URL or fails with a clear message. */
export function databaseUrl(): string {
  const url = process.env.DATABASE_URL;
  if (!url) throw new Error("DATABASE_URL is not set");
  return url;
}
