import { createHash, randomBytes } from "node:crypto";

export function newSessionToken(): string {
  return randomBytes(32).toString("base64url");
}

/** Only a SHA-256 of the session token is stored, so a database leak can't be replayed as a login. */
export function hashToken(token: string): string {
  return createHash("sha256").update(token).digest("hex");
}
